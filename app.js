const users = [{ username: 'usuario', password: 'usuario123', name: 'MisRutasBogotá' }];

const routes = {
  "Carrera 7": [[4.612492, -74.070479],[4.631328, -74.064242],[4.643209, -74.061965],[4.650634, -74.058316],[4.664709, -74.047201],[4.679909, -74.038094],[4.693194, -74.033474],[4.699452, -74.028890],[4.707009, -74.028625],[4.717274, -74.028625],[4.747298, -74.022660],[4.759059, -74.026007],[4.769699, -74.027037]],
  "NQS": [[4.603362, -74.176411],[4.601797, -74.178610],[4.597571, -74.177511],[4.596145, -74.171957],[4.596427, -74.154496],[4.595204, -74.145624],[4.595580, -74.141754],[4.594395, -74.131763],[4.594791, -74.119239],[4.598755, -74.107311],[4.609161, -74.095654],[4.627872, -74.081441],[4.661552, -74.076882],[4.674917, -74.068031],[4.680733, -74.058810],[4.761374, -74.045819]],
  "Avenida Caracas": [[4.569014, -74.125517],[4.575030, -74.122800],[4.578896, -74.107030],[4.585650, -74.094386],[4.609133, -74.075872],[4.623009, -74.069273],[4.653572, -74.063706],[4.655935, -74.062376],[4.664907, -74.060706]],
  "Boyaca": [[4.513258, -74.117625],[4.510503, -74.118727],[4.512405, -74.121770],[4.515048, -74.121380],[4.519296, -74.121894],[4.524459, -74.125703],[4.534629, -74.127413],[4.536783, -74.128883],[4.540459, -74.133297],[4.547957, -74.136779],[4.551820, -74.136369],[4.560096, -74.139000],[4.567897, -74.138083],[4.595222, -74.145479],[4.635495, -74.137029],[4.649462, -74.125951],[4.675009, -74.103559],[4.695832, -74.089179],[4.703281, -74.100509],[4.711535, -74.093455]],
  "El dorado": [[4.608767, -74.066169],[4.609965, -74.068025],[4.611109, -74.069486],[4.614214, -74.071799],[4.621665, -74.076953],[4.623624, -74.078440],[4.632714, -74.084891],[4.635273, -74.091193],[4.683516, -74.122380],[4.693860, -74.136575]]
};

const routeMaxTimes = {
  "Carrera 7": 40,
  "NQS": 90,
  "Avenida Caracas": 50,
  "Boyaca": 60,
  "El dorado": 70
};

const mockBuses = [
  { id: 'B12', route: 'Carrera 7', occupancy: 30, eta: 26 },
  { id: 'B18', route: 'Carrera 7', occupancy: 85, eta: 31 },
  { id: 'B21', route: 'Carrera 7', occupancy: 45, eta: 15 },
  { id: 'B25', route: 'Carrera 7', occupancy: 60, eta: 40 },
  { id: 'B05', route: 'NQS', occupancy: 55, eta: 19 },
  { id: 'B27', route: 'NQS', occupancy: 20, eta: 32 },
  { id: 'B29', route: 'NQS', occupancy: 70, eta: 22 },
  { id: 'B33', route: 'NQS', occupancy: 35, eta: 12 },
  { id: 'B99', route: 'Avenida Caracas', occupancy: 40, eta: 10 },
  { id: 'B98', route: 'Avenida Caracas', occupancy: 40, eta: 20 },
  { id: 'B95', route: 'Avenida Caracas', occupancy: 65, eta: 18 },
  { id: 'B96', route: 'Avenida Caracas', occupancy: 25, eta: 35 },
  { id: 'B60', route: 'Boyaca', occupancy: 20, eta: 12 },
  { id: 'B62', route: 'Boyaca', occupancy: 30, eta: 24 },
  { id: 'B64', route: 'Boyaca', occupancy: 50, eta: 18 },
  { id: 'B66', route: 'Boyaca', occupancy: 75, eta: 27 },
  { id: 'B77', route: 'El dorado', occupancy: 50, eta: 14 },
  { id: 'B74', route: 'El dorado', occupancy: 45, eta: 28 },
  { id: 'B72', route: 'El dorado', occupancy: 20, eta: 22 },
  { id: 'B70', route: 'El dorado', occupancy: 65, eta: 16 }
];

let buses = JSON.parse(JSON.stringify(mockBuses));

const SIM_SECONDS_PER_SIMULATED_MINUTE = 2; // controla rapidez visual: 1-3s por minuto simulado

function initBusRuntime(bus) {
  const route = routes[bus.route];
  const n = route.length;
  const t = Math.random() * (n - 1);
  bus.segmentIndex = Math.floor(t);
  if (bus.segmentIndex >= n - 1) bus.segmentIndex = n - 2;
  bus.routeProgress = t - bus.segmentIndex;
  bus.direction = Math.random() < 0.5 ? 1 : -1;
  if (bus.direction === -1 && bus.segmentIndex === 0) bus.direction = 1;

  const segCount = Math.max(1, n - 1);
  bus.maxEta = routeMaxTimes[bus.route] || 60;

  const baseSpeed = segCount / (bus.maxEta * SIM_SECONDS_PER_SIMULATED_MINUTE);
  bus.speed = baseSpeed * (0.85 + Math.random() * 0.3); // ligero ruido entre buses

  const endIdx = bus.segmentIndex + (bus.direction === 1 ? 1 : -1);
  const p0 = route[bus.segmentIndex];
  const p1 = route[Math.max(0, Math.min(n - 1, endIdx))];
  const latlon = interpolate(p0, p1, bus.routeProgress);
  bus.lat = latlon[0];
  bus.lon = latlon[1];

  const s = bus.segmentIndex + bus.routeProgress;
  const progressUnits = s;
  const remainingFraction = bus.direction === 1 ? Math.max(0, (segCount - progressUnits) / segCount) : Math.max(0, progressUnits / segCount);
  bus.etaSec = Math.round(bus.maxEta * 60 * remainingFraction);
}
buses.forEach(initBusRuntime);

const loginCard = document.getElementById('loginCard');
const dashboard = document.getElementById('dashboard');
const btnLogin = document.getElementById('btnLogin');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const profileDiv = document.getElementById('profile');
const routesList = document.getElementById('routesList');
const alertsList = document.getElementById('alertsList');
const busInfo = document.getElementById('busInfo');
const btnExport = document.getElementById('btnExport');
const busForm = document.getElementById('busForm');

btnLogin.addEventListener('click', login);
btnExport.addEventListener('click', exportCSV);
busForm.addEventListener('submit', addBus);

function login() {
  const u = usernameInput.value.trim(), p = passwordInput.value.trim();
  const valid = users.find(x => x.username === u && x.password === p);
  if (!valid) { alert('Credenciales incorrectas. Usa usuario/usuario123'); return; }
  loginCard.classList.add('hidden'); dashboard.classList.remove('hidden');
  profileDiv.innerHTML = `<strong>${valid.name}</strong><div style="font-size:13px;color:#666">Usuario: ${valid.username}</div>`;
  initMap();
  setTimeout(() => { if (map) map.invalidateSize(); }, 250);
  renderMap();
  renderRouteList();
  updateAlerts();
  startSimulation();
  updateChart();
}

let map; let busMarkers = {}; let selectedBusId = null;

function initMap(){
  if (map) return;
  map = L.map('map', { preferCanvas: true }).setView([4.66, -74.08], 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap' }).addTo(map);
}

function renderMap(){
  if (!map) initMap();
  buses.forEach(bus => {
    const popupHtml = `<b>Bus ${bus.id} (${bus.route})</b><br>Tiempo de llegada: ${displayMinutes(bus)} min<br>Ocupación: ${Math.round(bus.occupancy)}%`;
    if (busMarkers[bus.id]) {
      busMarkers[bus.id].setLatLng([bus.lat, bus.lon]);
      busMarkers[bus.id].setPopupContent(popupHtml);
    } else {
      const marker = L.marker([bus.lat, bus.lon]).addTo(map);
      marker.bindPopup(popupHtml);
      marker.on('click', () => {
        selectedBusId = bus.id;
        showBusInfoById(bus.id);
        marker.openPopup();
      });
      busMarkers[bus.id] = marker;
    }
  });
}

function interpolate(p0, p1, t) {
  return [p0[0] + (p1[0] - p0[0]) * t, p0[1] + (p1[1] - p0[1]) * t];
}

function displayMinutes(bus) {
  return Math.max(0, Math.ceil((bus.etaSec || 0) / 60));
}

function showBusInfoById(id) {
  const bus = buses.find(b => b.id === id);
  if (!bus) return;
  busInfo.innerHTML = `
    <div><strong>Bus ${bus.id} (${bus.route})</strong></div>
    <div>Tiempo de llegada: <strong>${displayMinutes(bus)} min</strong></div>
    <div>Ocupación: <strong>${Math.round(bus.occupancy)}%</strong></div>
    <div>Velocidad simulada: <strong>${bus.speed.toFixed(3)}</strong></div>
  `;
}

function renderRouteList() {
  routesList.innerHTML = '';
  buses.forEach(bus => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>Ruta ${bus.route}</strong> — Bus ${bus.id} — Tiempo de llegada ${displayMinutes(bus)} min — Ocupación ${Math.round(bus.occupancy)}%`;
    routesList.appendChild(li);
  });
}

function updateAlerts() {
  alertsList.innerHTML = '';
  buses.forEach(bus => {
    if (bus.occupancy >= 80) {
      const li = document.createElement('li');
      li.className = 'alert';
      li.textContent = `Alta ocupación: Bus ${bus.id} — ${Math.round(bus.occupancy)}%`;
      alertsList.appendChild(li);
    }
    if (displayMinutes(bus) >= 15) {
      const li = document.createElement('li');
      li.className = 'alert';
      li.textContent = `Retraso: Bus ${bus.id} — Tiempo de llegada ${displayMinutes(bus)} min`;
      alertsList.appendChild(li);
    }
  });
  if (!alertsList.firstChild) alertsList.innerHTML = '<li style="color:#4b5563">No hay alertas</li>';
}

function stepSimulation() {
  buses.forEach(bus => {
    const route = routes[bus.route];
    if (!route || route.length < 2) return;

    bus.routeProgress += bus.speed;
    while (bus.routeProgress >= 1) {
      bus.routeProgress -= 1;
      bus.segmentIndex += bus.direction;
      if (bus.segmentIndex >= route.length - 1) {
        bus.segmentIndex = route.length - 2;
        bus.direction = -1;
        bus.etaSec = bus.maxEta * 60;
      } else if (bus.segmentIndex <= 0) {
        bus.segmentIndex = 0;
        bus.direction = 1;
        bus.etaSec = bus.maxEta * 60;
      }
    }

    let nextIdx = bus.segmentIndex + (bus.direction === 1 ? 1 : -1);
    if (nextIdx < 0) nextIdx = 0;
    if (nextIdx > route.length - 1) nextIdx = route.length - 1;
    const p0 = route[bus.segmentIndex];
    const p1 = route[nextIdx];
    const latlon = interpolate(p0, p1, bus.routeProgress);
    bus.lat = latlon[0];
    bus.lon = latlon[1];

    bus.occupancy = Math.max(5, Math.min(100, bus.occupancy + (Math.random() * 2 - 1)));

    const segCount = Math.max(1, route.length - 1);
    const s = bus.segmentIndex + bus.routeProgress;
    const progressUnits = s;
    const remainingFraction = bus.direction === 1 ? Math.max(0, (segCount - progressUnits) / segCount) : Math.max(0, progressUnits / segCount);
    bus.etaSec = Math.max(0, Math.round(bus.maxEta * 60 * remainingFraction));

    if (selectedBusId === bus.id) showBusInfoById(bus.id);
  });

  renderRouteList();
  updateAlerts();
  renderMap();
  updateChart();
}

let simInterval = null;
function startSimulation() { if (simInterval) clearInterval(simInterval); simInterval = setInterval(stepSimulation, 1000); }

function exportCSV() {
  let csv = 'id,route,lat,lon,occupancy,tiempo_llegada_min\n';
  buses.forEach(b => {
    csv += `${b.id},${b.route},${b.lat.toFixed(6)},${b.lon.toFixed(6)},${Math.round(b.occupancy)},${displayMinutes(b)}\n`;
  });
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'aca3_demo.csv';
  document.body.appendChild(a); a.click(); a.remove();
}

function addBus(e) {
  e.preventDefault();
  const id = document.getElementById('busId').value.trim();
  const route = document.getElementById('busRoute').value;
  if (!id || !route) { alert('Completa todos los campos'); return; }
  const newBus = { id, route, occupancy: Math.floor(Math.random() * 60) + 20, eta: Math.floor(Math.random() * 30) + 5 };
  newBus.maxEta = routeMaxTimes[newBus.route] || 60;
  initBusRuntime(newBus);
  buses.push(newBus);
  document.getElementById('busForm').reset();
  alert(`Bus ${id} agregado a ${route}`);
}

let chart;
function updateChart(){
  const canvas = document.getElementById('occupancyChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const avg = {};
  buses.forEach(b => { if (!avg[b.route]) avg[b.route] = []; avg[b.route].push(b.occupancy); });
  const labels = Object.keys(avg);
  const data = labels.map(r => Math.round(avg[r].reduce((a, c) => a + c, 0) / avg[r].length));
  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: 'bar',
    data: { labels: labels, datasets: [{ label: 'Ocupación promedio (%)', data: data, backgroundColor: '#2563eb' }] },
    options: { scales: { y: { beginAtZero: true, max: 100,ticks: { stepSize: 10 } } } }
  });
}

window.addEventListener('resize', () => { if (map) setTimeout(() => map.invalidateSize(), 150); });
