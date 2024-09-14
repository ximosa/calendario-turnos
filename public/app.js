// Configuración de Firebase (reemplaza con tus propias credenciales)
const firebaseConfig = {
  apiKey: "AIzaSyDZhAMDoqUyHCw-Z5t-TuFXSPSaIBU6atM",
  authDomain: "descargas-46d41.firebaseapp.com",
  databaseURL: "https://descargas-46d41.firebaseio.com",
  projectId: "descargas-46d41",
  storageBucket: "descargas-46d41.appspot.com",
  messagingSenderId: "874647380507",
  appId: "1:874647380507:web:1e54bd5e3e6e2e3017cebe"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Referencias a elementos del DOM
const loginButton = document.getElementById('loginButton');
const logoutButton = document.getElementById('logoutButton');
const userInfo = document.getElementById('userInfo');
const userName = document.getElementById('userName');
const monthViewDiv = document.getElementById('monthView');
const weekViewDiv = document.getElementById('weekView');
const totalHoursDiv = document.getElementById('totalHours');
const shiftDistributionDiv = document.getElementById('shiftDistribution');
const prevPeriodButton = document.getElementById('prevPeriod');
const nextPeriodButton = document.getElementById('nextPeriod');
const currentPeriodSpan = document.getElementById('currentPeriod');
const shiftModal = document.getElementById('shiftModal');
const shiftSelect = document.getElementById('shiftSelect');
const hoursInput = document.getElementById('hoursInput');
const saveShiftButton = document.getElementById('saveShift');
const cancelShiftButton = document.getElementById('cancelShift');
const exportCSVButton = document.getElementById('exportCSV');
const customizeColorsButton = document.getElementById('customizeColors');
const colorModal = document.getElementById('colorModal');
const saveColorsButton = document.getElementById('saveColors');
const cancelColorsButton = document.getElementById('cancelColors');
const monthViewButton = document.getElementById('monthViewButton');
const weekViewButton = document.getElementById('weekViewButton');

// Variables globales
let currentUser = null;
let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();
let currentWeek = getWeekNumber(new Date());
let selectedDay = null;
let currentView = 'month';
let shiftColors = {
    mañana: '#FFD700',
    tarde: '#87CEEB',
    noche: '#4B0082'
};

// Funciones de autenticación
loginButton.addEventListener('click', () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider);
});

logoutButton.addEventListener('click', () => {
    firebase.auth().signOut();
});

firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        currentUser = user;
        userInfo.style.display = 'flex';
        loginButton.style.display = 'none';
        userName.textContent = user.displayName;
        loadCalendar();
        requestNotificationPermission();
    } else {
        currentUser = null;
        userInfo.style.display = 'none';
        loginButton.style.display = 'flex';
        monthViewDiv.innerHTML = '';
        weekViewDiv.innerHTML = '';
        totalHoursDiv.innerHTML = '';
        shiftDistributionDiv.innerHTML = '';
    }
});

// Funciones del calendario
function loadCalendar() {
    if (currentView === 'month') {
        loadMonthView();
    } else {
        loadWeekView();
    }
}

function loadMonthView() {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    let calendarHTML = `<table>
                            <tr>
                                <th>Lun</th><th>Mar</th><th>Mié</th><th>Jue</th><th>Vie</th><th>Sáb</th><th>Dom</th>
                            </tr>`;

    let dayCount = 1;
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const startingDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    for (let i = 0; i < 6; i++) {
        calendarHTML += '<tr>';
        for (let j = 0; j < 7; j++) {
            if (i === 0 && j < startingDay) {
                calendarHTML += '<td></td>';
            } else if (dayCount <= daysInMonth) {
                calendarHTML += `<td id="day-${dayCount}" onclick="openShiftModal(${dayCount})">${dayCount}</td>`;
                dayCount++;
            } else {
                calendarHTML += '<td></td>';
            }
        }
        calendarHTML += '</tr>';
        if (dayCount > daysInMonth) break;
    }
    calendarHTML += '</table>';
    monthViewDiv.innerHTML = calendarHTML;
    currentPeriodSpan.textContent = `${getMonthName(currentMonth)} ${currentYear}`;

    loadShifts();
}

function loadWeekView() {
    const startOfWeek = getStartOfWeek(currentYear, currentWeek);
    let weekHTML = `<table>
                        <tr>
                            <th>Lun</th><th>Mar</th><th>Mié</th><th>Jue</th><th>Vie</th><th>Sáb</th><th>Dom</th>
                        </tr>
                        <tr>`;

    for (let i = 0; i < 7; i++) {
        const currentDate = new Date(startOfWeek);
        currentDate.setDate(startOfWeek.getDate() + i);
        weekHTML += `<td id="day-${currentDate.getDate()}" onclick="openShiftModal(${currentDate.getDate()})">${currentDate.getDate()}</td>`;
    }

    weekHTML += '</tr></table>';
    weekViewDiv.innerHTML = weekHTML;
    currentPeriodSpan.textContent = `Semana ${currentWeek}, ${currentYear}`;

    loadShifts();
}

function getMonthName(monthIndex) {
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return months[monthIndex];
}

function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
    return weekNo;
}

function getStartOfWeek(year, week) {
    const simple = new Date(year, 0, 1 + (week - 1) * 7);
    const dow = simple.getDay();
    const startOfWeek = simple;
    if (dow <= 4)
        startOfWeek.setDate(simple.getDate() - simple.getDay() + 1);
    else
        startOfWeek.setDate(simple.getDate() + 8 - simple.getDay());
    return startOfWeek;
}

function openShiftModal(day) {
    selectedDay = day;
    shiftModal.style.display = 'block';
}

function closeShiftModal() {
    shiftModal.style.display = 'none';
    selectedDay = null;
}

function saveShift() {
    const shift = shiftSelect.value;
    const hours = parseInt(hoursInput.value);
    if (hours < 1 || hours > 24) {
        alert('Por favor, introduce un número de horas válido (1-24).');
        return;
    }
    saveShiftToFirebase(selectedDay, shift, hours);
    closeShiftModal();
}

function saveShiftToFirebase(day, shift, hours) {
    const userId = currentUser.uid;
    const shiftRef = firebase.database().ref(`users/${userId}/calendars/default/${currentYear}/${currentMonth + 1}/${day}`);

    if (shift === "" || hours === 0) { // Si no hay turno o las horas son 0
        shiftRef.remove() // Elimina la entrada del día en la base de datos
            .then(() => {
                console.log('Turno eliminado correctamente');
                loadShifts(); // Recarga los turnos para reflejar el cambio
            })
            .catch(error => console.error('Error al eliminar el turno:', error));
    } else {
        shiftRef.set({ shift, hours })
            .then(() => {
                console.log('Turno guardado correctamente');
                loadShifts(); // Recarga los turnos para reflejar el cambio
            })
            .catch(error => console.error('Error al guardar el turno:', error));
    }
}


function loadShifts() {
    const userId = currentUser.uid;
    const monthRef = firebase.database().ref(`users/${userId}/calendars/default/${currentYear}/${currentMonth + 1}`);
    monthRef.once('value', (snapshot) => {
        const shifts = snapshot.val();
        let totalHours = 0;
        let shiftCounts = { mañana: 0, tarde: 0, noche: 0 };

        // Iterar sobre todos los días del mes
        for (let day = 1; day <= new Date(currentYear, currentMonth + 1, 0).getDate(); day++) {
            const dayElement = document.getElementById(`day-${day}`);
            if (shifts && shifts[day]) { // Verificar si existe el turno para el día
                const { shift, hours } = shifts[day];
                dayElement.style.backgroundColor = shiftColors[shift];
                dayElement.innerHTML = `
                    <div class="day-number">${day}</div>
                    <div class="shift-info">
                        <span class="shift-name">${shift}</span>
                        <span class="shift-hours">${hours}h</span>
                    </div>
                `;
                totalHours += hours;
                shiftCounts[shift]++;
            } else {
                // Limpiar contenido de la celda si no hay turno
                dayElement.style.backgroundColor = ''; // O el color por defecto de tu calendario
                dayElement.innerHTML = `<div class="day-number">${day}</div>`; // Solo el número del día
            }
        }

        updateStatistics(totalHours, shiftCounts);
    });
}


function updateStatistics(totalHours, shiftCounts) {
    totalHoursDiv.textContent = `Total de horas este período: ${totalHours}`;
    
    const total = shiftCounts.mañana + shiftCounts.tarde + shiftCounts.noche;
    const distribution = Object.entries(shiftCounts).map(([shift, count]) => {
        const percentage = (count / total * 100).toFixed(2);
        return `${shift}: ${count} (${percentage}%)`;
    }).join('<br>');
    
    shiftDistributionDiv.innerHTML = `Distribución de turnos:<br>${distribution}`;
}

function exportToCSV() {
    const userId = currentUser.uid;
    const monthRef = firebase.database().ref(`users/${userId}/calendars/default/${currentYear}/${currentMonth + 1}`);
    monthRef.once('value', (snapshot) => {
        const shifts = snapshot.val();
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Fecha,Turno,Horas\n";
        
        for (const day in shifts) {
            const { shift, hours } = shifts[day];
            const date = new Date(currentYear, currentMonth, day).toLocaleDateString();
            csvContent += `${date},${shift},${hours}\n`;
        }
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `turnos_${currentYear}_${currentMonth + 1}.csv`);
        document.body.appendChild(link);
        link.click();
    });
}

function openColorModal() {
    document.getElementById('colorMañana').value = shiftColors.mañana;
    document.getElementById('colorTarde').value = shiftColors.tarde;
    document.getElementById('colorNoche').value = shiftColors.noche;
    colorModal.style.display = 'block';
}

function closeColorModal() {
    colorModal.style.display = 'none';
}

function saveColors() {
    shiftColors.mañana = document.getElementById('colorMañana').value;
    shiftColors.tarde = document.getElementById('colorTarde').value;
    shiftColors.noche = document.getElementById('colorNoche').value;
    
    const userId = currentUser.uid;
    firebase.database().ref(`users/${userId}/preferences/colors`).set(shiftColors)
        .then(() => {
            closeColorModal();
            loadShifts();
        })
        .catch(error => console.error('Error saving colors:', error));
}

function loadUserPreferences() {
    const userId = currentUser.uid;
    firebase.database().ref(`users/${userId}/preferences/colors`).once('value', (snapshot) => {
        const colors = snapshot.val();
        if (colors) {
            shiftColors = colors;
            loadShifts();
        }
    });
}

function requestNotificationPermission() {
    Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
            messaging.getToken().then((currentToken) => {
                if (currentToken) {
                    saveTokenToDatabase(currentToken);
                }
            });
        }
    });
}

function saveTokenToDatabase(token) {
    const userId = currentUser.uid;
    firebase.database().ref(`users/${userId}/notificationToken`).set(token);
}

// Event Listeners
prevPeriodButton.addEventListener('click', () => {
    if (currentView === 'month') {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
    } else {
        currentWeek--;
        if (currentWeek < 1) {
            currentYear--;
            currentWeek = getWeekNumber(new Date(currentYear, 11, 31));
        }
    }
    loadCalendar();
});

nextPeriodButton.addEventListener('click', () => {
    if (currentView === 'month') {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
    } else {
        currentWeek++;
        if (currentWeek > 52) {
            currentYear++;
            currentWeek = 1;
        }
    }
    loadCalendar();
});

saveShiftButton.addEventListener('click', saveShift);
cancelShiftButton.addEventListener('click', closeShiftModal);
exportCSVButton.addEventListener('click', exportToCSV);
customizeColorsButton.addEventListener('click', openColorModal);
saveColorsButton.addEventListener('click', saveColors);
cancelColorsButton.addEventListener('click', closeColorModal);

monthViewButton.addEventListener('click', () => {
    currentView = 'month';
    monthViewDiv.style.display = 'block';
    weekViewDiv.style.display = 'none';
    loadCalendar();
});

weekViewButton.addEventListener('click', () => {
    currentView = 'week';
    monthViewDiv.style.display = 'none';
    weekViewDiv.style.display = 'block';
    loadCalendar();
});

// Inicializar calendario
loadUserPreferences();
loadCalendar();

// Configurar Firebase Cloud Messaging para notificaciones
messaging.onMessage((payload) => {
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/path/to/icon.png'
    };

    new Notification(notificationTitle, notificationOptions);
});