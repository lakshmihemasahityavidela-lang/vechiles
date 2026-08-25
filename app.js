const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

let toastTimer;
let corridorActive = true;
let routeVariant = 0;

function showToast(message, tone = 'success') {
  const toast = $('#toast');
  const text = $('#toastText');
  const icon = $('.toast-icon', toast);
  text.textContent = message;
  icon.textContent = tone === 'warning' ? '!' : '✓';
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
}

function setSyncTime() {
  const now = new Date();
  $('#syncTime').textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function getPriority() {
  return $('input[name="priority"]:checked')?.value || 'Critical';
}

function updatePriorityCards() {
  $$('.priority-option').forEach(option => {
    const input = $('input', option);
    option.classList.toggle('selected', input.checked);
  });
}

function updatePrediction() {
  const density = Number($('#densityRange').value);
  const speed = Number($('#speedRange').value);
  const vehicles = Number($('#vehicleCount').value) || 1;
  const roadLength = Number($('#roadLength').value) || 1;
  const score = Math.max(0, Math.min(100, density * 0.7 + Math.max(0, 55 - speed) * 0.55 + Math.min(16, vehicles / 4) + roadLength * 1.5));
  const level = score >= 81 ? 'SEVERE' : score >= 61 ? 'HIGH' : score >= 36 ? 'MEDIUM' : 'LOW';
  const minutes = Math.max(4, Math.round((roadLength / Math.max(speed, 5)) * 60 * (1 + score / 100)));
  $('#trafficLevel').textContent = level;
  $('#trafficLevel').style.color = level === 'LOW' ? 'var(--green)' : level === 'MEDIUM' ? 'var(--orange)' : 'var(--red)';
  $('#predictedMinutes').textContent = String(minutes).padStart(2, '0');
  $('#speedReadout').textContent = `${speed} km/h`;
  $('#densityReadout').textContent = `${Math.round(density)}%`;
  $('#densityOutput').textContent = `${Math.round(density)}%`;
  $('#speedOutput').textContent = `${speed} km/h`;
  $('#mapTraffic').textContent = level.charAt(0) + level.slice(1).toLowerCase();
  $('#mapTraffic').className = level === 'LOW' ? 'text-green' : '';
  $('#mapEta').textContent = `${String(minutes).padStart(2, '0')}:0${Math.min(9, Math.round(score / 18))}`;
}

function setCorridorState(active) {
  corridorActive = active;
  $('#corridorStatus').textContent = active ? 'GREEN CORRIDOR ACTIVE' : 'CORRIDOR ON STANDBY';
  $('#corridorStatus').style.color = active ? 'var(--green)' : 'var(--orange)';
  $$('.green-light').forEach(light => {
    light.classList.toggle('red-light', !active);
    light.classList.toggle('green-light', active);
    $('i', light).style.background = active ? 'var(--green-strong)' : 'var(--red)';
    $('i', light).style.boxShadow = active ? '0 0 8px var(--green-strong)' : '0 0 8px var(--red)';
    light.childNodes[light.childNodes.length - 1].textContent = active ? 'GREEN' : 'RED';
  });
  $('.signal-status .pulse-dot').style.background = active ? 'var(--green-strong)' : 'var(--orange)';
  showToast(active ? 'Green corridor activated for AMB-07' : 'Vehicle pass simulated — signals released');
}

function cycleRoute(trafficEvent = false) {
  routeVariant = (routeVariant + 1) % 2;
  const marker = $('#vehicleMarker');
  marker.style.left = routeVariant === 0 ? '72%' : '61%';
  marker.style.top = routeVariant === 0 ? '34%' : '48%';
  $('#mapDistance').textContent = routeVariant === 0 ? '3.8 km' : '4.2 km';
  $('#mapEta').textContent = routeVariant === 0 ? '02:18' : '03:44';
  $('#mapTraffic').textContent = routeVariant === 0 ? 'Low' : 'Moderate';
  $('#mapTraffic').className = routeVariant === 0 ? 'text-green' : '';
  $$('.route-row').forEach((row, index) => row.classList.toggle('recommended', index === routeVariant));
  $$('.best-pill').forEach(pill => pill.remove());
  const bestRow = $('.route-row.recommended');
  if (bestRow) bestRow.insertAdjacentHTML('beforeend', '<span class="best-pill">BEST</span>');
  if (trafficEvent) {
    $('#routeList').animate([{ opacity: .35 }, { opacity: 1 }], { duration: 350, easing: 'ease-out' });
    showToast('Route Recalculated Due to Traffic Change', 'warning');
  } else {
    showToast(routeVariant === 0 ? 'Best route confirmed: 3.8 km / 08 min' : 'Alternative route selected: 4.2 km / 11 min');
  }
}

$('#requestForm').addEventListener('submit', event => {
  event.preventDefault();
  const vehicle = $('#vehicleType').value;
  const source = $('#source').value || 'City Hospital';
  const destination = $('#destination').value || 'North District';
  const priority = getPriority();
  const score = { Critical: 90, High: 70, Normal: 40 }[priority];
  $('.route-summary strong').textContent = `${vehicle} request active`;
  $('.route-summary small').innerHTML = `${source} <b>→</b> ${destination}`;
  $('#corridorStatus').textContent = 'GREEN CORRIDOR ACTIVE';
  setCorridorState(true);
  showToast(`${priority} ${vehicle} request created · priority score ${score}`);
});

$$('input[name="priority"]').forEach(input => input.addEventListener('change', updatePriorityCards));
$('#predictBtn').addEventListener('click', () => { updatePrediction(); showToast(`Traffic prediction updated: ${$('#trafficLevel').textContent}`); });
$('#predictFormBtn').addEventListener('click', () => { updatePrediction(); showToast(`Local model returned ${$('#trafficLevel').textContent} congestion`); });
$('#densityRange').addEventListener('input', updatePrediction);
$('#speedRange').addEventListener('input', updatePrediction);
$('#vehicleCount').addEventListener('input', updatePrediction);
$('#roadLength').addEventListener('input', updatePrediction);
$('#findRouteBtn').addEventListener('click', () => cycleRoute(false));
$('#recalcBtn').addEventListener('click', () => cycleRoute(true));
$('#trafficEventBtn').addEventListener('click', () => cycleRoute(true));
$('#simulatePassBtn').addEventListener('click', () => setCorridorState(false));
$('#refreshData').addEventListener('click', () => { routeVariant = 0; setCorridorState(true); updatePrediction(); setSyncTime(); showToast('Simulation data refreshed'); });
$('#notificationBtn').addEventListener('click', () => showToast('2 operational notes · all systems nominal'));
$('#exportBtn').addEventListener('click', () => showToast('Briefing prepared for local download'));
$('#mapExpand').addEventListener('click', () => { $('#mapCanvas').classList.toggle('expanded'); showToast('Map focus mode toggled'); });
$('#predictScroll').addEventListener('click', () => $('#predictorPanel').scrollIntoView({ behavior: 'smooth', block: 'center' }));

$$('.nav-item').forEach(button => button.addEventListener('click', () => {
  $$('.nav-item').forEach(item => item.classList.remove('active'));
  button.classList.add('active');
  const view = button.dataset.view;
  if (view === 'traffic') $('#predictorPanel').scrollIntoView({ behavior: 'smooth', block: 'center' });
  else if (view === 'signals') $('.signal-panel').scrollIntoView({ behavior: 'smooth', block: 'center' });
  else if (view === 'corridor') $('.map-panel').scrollIntoView({ behavior: 'smooth', block: 'center' });
  else if (view !== 'overview') showToast(`${button.textContent.trim()} is available in the next prototype milestone`, 'warning');
}));

$$('.map-controls button').forEach((button, index) => button.addEventListener('click', () => {
  if (index === 2) { $('#vehicleMarker').style.left = '72%'; $('#vehicleMarker').style.top = '34%'; showToast('Vehicle marker centered'); }
  else showToast(index === 0 ? 'Map zoomed in' : 'Map zoomed out');
}));

setSyncTime();
setInterval(setSyncTime, 30000);
updatePriorityCards();
updatePrediction();
