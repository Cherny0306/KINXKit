const logEl = document.getElementById('log');
const statusEl = document.getElementById('status');
const toastEl = document.getElementById('toast');
function setStatus(s){ statusEl.textContent = s; }
function toast(msg){ toastEl.textContent = msg; toastEl.classList.add('show'); setTimeout(()=>toastEl.classList.remove('show'), 1500); }

const logs = [];
let filterLevel = 'info';
document.getElementById('logFilter').addEventListener('change', (e)=>{ filterLevel = e.target.value; renderLogs(); });

function renderLogs(){
  const order = ['debug','info','warn','error'];
  logEl.textContent = logs.filter(l => order.indexOf(l.level) >= order.indexOf(filterLevel))
    .map(l => `[${l.ts}] ${l.level.toUpperCase()} ${l.message}`).join('\n');
  logEl.scrollTop = logEl.scrollHeight;
}
async function writeLog(level, message){
  const res = await window.api.writeLog({ level, message });
  const ts = new Date().toISOString();
  logs.push({ ts, level, message });
  renderLogs();
  if (!res.ok) toast(`日志写入失败: ${res.error}`);
}

document.getElementById('btnDetect').addEventListener('click', async () => {
  setStatus('Detecting...');
  try {
    const info = await window.api.detectEnv();
    await writeLog('info', `Env: ${JSON.stringify(info)}`);
  } catch (e) { await writeLog('error', e.message||String(e)); }
  setStatus('Ready');
});
document.getElementById('btnDiagnose').addEventListener('click', async () => {
  setStatus('Diagnosing...');
  try {
    const r = await window.api.diagnose();
    await writeLog('info', `Diagnose: ${JSON.stringify(r.summary)}`);
    updateChartFromSummary(r.summary);
  } catch (e) { await writeLog('error', e.message||String(e)); }
  setStatus('Ready');
});

document.getElementById('btnCreate').addEventListener('click', async () => {
  const name = document.getElementById('projName').value || 'my-project';
  const type = document.getElementById('projType').value;
  const gpu = document.getElementById('projGpu').value === 'true';
  const path = document.getElementById('projPath').value || `./${name}`;
  const description = document.getElementById('projDesc').value || name;
  setStatus('Creating...');
  try {
    const r = await window.api.createProject({ name, type, gpu, path, description });
    await writeLog('info', `Project created: ${r.path}`);
    toast('项目创建成功');
  } catch (e) { await writeLog('error', e.message||String(e)); toast('项目创建失败'); }
  setStatus('Ready');
});

document.getElementById('btnUp').addEventListener('click', async () => {
  const projectPath = document.getElementById('dockPath').value || './my-project';
  setStatus('Starting...');
  try {
    const r = await window.api.dockerUp({ projectPath, detached: true });
    await writeLog('info', `Docker up: ${r.ok}`);
  } catch (e) { await writeLog('error', e.message||String(e)); }
  setStatus('Ready');
});
document.getElementById('btnDown').addEventListener('click', async () => {
  const projectPath = document.getElementById('dockPath').value || './my-project';
  setStatus('Stopping...');
  try {
    const r = await window.api.dockerDown({ projectPath, volumes: false });
    await writeLog('info', `Docker down: ${r.ok}`);
  } catch (e) { await writeLog('error', e.message||String(e)); }
  setStatus('Ready');
});
document.getElementById('btnStatus').addEventListener('click', async () => {
  const projectPath = document.getElementById('dockPath').value || './my-project';
  setStatus('Checking...');
  try {
    const s = await window.api.dockerStatus({ projectPath });
    document.getElementById('statusArea').textContent = JSON.stringify(s, null, 2);
    await writeLog('info', `Docker status: ${JSON.stringify(s)}`);
  } catch (e) { await writeLog('error', e.message||String(e)); }
  setStatus('Ready');
});

document.getElementById('btnApplyAi').addEventListener('click', async () => {
  const service = document.getElementById('aiService').value;
  const apiKey = document.getElementById('aiKey').value;
  const model = document.getElementById('aiModel').value;
  setStatus('Applying preset...');
  try {
    const r = await window.api.applyAiPreset({ service, apiKey, model });
    await writeLog('info', `AI preset saved: ${r.ok}`);
    toast('AI 预设已保存到 .env');
  } catch (e) { await writeLog('error', e.message||String(e)); toast('AI 预设保存失败'); }
  setStatus('Ready');
});

document.getElementById('btnPickDbDir').addEventListener('click', async () => {
  const dir = await window.api.chooseDir();
  if (dir) document.getElementById('dbDir').value = dir;
});
document.getElementById('btnSaveDbPreset').addEventListener('click', async () => {
  const host = document.getElementById('dbHost').value || 'localhost';
  const port = parseInt(document.getElementById('dbPort').value || '5432', 10);
  const database = document.getElementById('dbName').value || 'mydb';
  const user = document.getElementById('dbUser').value || 'user';
  const password = document.getElementById('dbPass').value || 'password';
  const dirPath = document.getElementById('dbDir').value || '.';
  setStatus('Saving preset...');
  const data = { host, port, database, user, password };
  const res = await window.api.saveJson({ dirPath, fileName: 'db_preset.json', data });
  if (res.ok) { toast('保存成功'); await writeLog('info', `DB preset saved: ${res.path}`); }
  else { toast(`保存失败: ${res.error}`); await writeLog('error', res.error); }
  setStatus('Ready');
});

document.getElementById('btnPickLogDir').addEventListener('click', async () => {
  const dir = await window.api.chooseDir();
  if (dir) document.getElementById('logDir').value = dir;
});
document.getElementById('btnApplyLog').addEventListener('click', async () => {
  const dirPath = document.getElementById('logDir').value || '';
  const res = await window.api.setLogDir({ dirPath });
  if (res.ok) { toast('日志目录已应用'); await writeLog('info', `Log dir: ${res.dirPath}`); }
  else { toast(`日志目录设置失败: ${res.error}`); await writeLog('error', res.error); }
});

let chart;
function ensureChart(type) {
  const ctx = document.getElementById('diagChart').getContext('2d');
  if (chart) chart.destroy();
  const base = {
    type,
    data: { labels: ['critical','high','medium','low','info'], datasets: [{ label: 'Issues', data: [0,0,0,0,0], backgroundColor: ['#d32f2f','#f57c00','#fbc02d','#0288d1','#9e9e9e'], borderColor: '#1976d2' }] },
    options: { responsive: true, animation: false }
  };
  chart = new Chart(ctx, base);
}
function updateChartFromSummary(summary){
  const vals = [summary.critical, summary.high, summary.medium, summary.low, summary.info];
  if (!chart) ensureChart(document.getElementById('chartType').value);
  chart.data.datasets[0].data = vals;
  chart.update();
}
document.getElementById('chartType').addEventListener('change', (e)=>{ ensureChart(e.target.value); });

let pollTimer = null;
async function refreshChartOnce(){
  try {
    const r = await window.api.diagnose();
    await writeLog('debug', `Poll summary: ${JSON.stringify(r.summary)}`);
    updateChartFromSummary(r.summary);
  } catch (e) { await writeLog('error', e.message||String(e)); }
}
document.getElementById('btnStartPoll').addEventListener('click', () => {
  const sec = parseInt(document.getElementById('pollSec').value || '5', 10);
  if (pollTimer) clearInterval(pollTimer);
  pollTimer = setInterval(refreshChartOnce, Math.max(1, sec) * 1000);
  toast('已开始自动刷新');
});
document.getElementById('btnStopPoll').addEventListener('click', () => {
  if (pollTimer) { clearInterval(pollTimer); pollTimer = null; toast('已停止自动刷新'); }
});
document.getElementById('btnRefreshChart').addEventListener('click', refreshChartOnce);

document.getElementById('btnExportPng').addEventListener('click', () => {
  if (!chart) ensureChart('bar');
  const url = chart.toBase64Image();
  const a = document.createElement('a');
  a.href = url;
  a.download = 'diagnose.png';
  a.click();
  toast('已导出 PNG');
});
document.getElementById('btnExportPdf').addEventListener('click', () => {
  if (!chart) ensureChart('bar');
  const url = chart.toBase64Image();
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'landscape', unit: 'px', format: [800, 600] });
  const imgProps = doc.getImageProperties(url);
  const w = 700, h = imgProps.height * (w / imgProps.width);
  doc.addImage(url, 'PNG', 50, 50, w, h);
  doc.save('diagnose.pdf');
  toast('已导出 PDF');
});

document.getElementById('btnGhCreate').addEventListener('click', async () => {
  const projectPath = document.getElementById('ghPath').value || './my-project';
  const name = document.getElementById('ghName').value || 'my-project';
  const description = document.getElementById('ghDesc').value || '';
  const privateRepo = document.getElementById('ghPrivate').value === 'true';
  setStatus('Creating repo...');
  try {
    const r = await window.api.githubCreate({ projectPath, name, description, privateRepo });
    await writeLog('info', `GitHub create: ${r.ok}`);
    toast(r.ok ? '仓库创建成功' : '仓库创建失败');
  } catch (e) { await writeLog('error', e.message||String(e)); toast('仓库创建失败'); }
  setStatus('Ready');
});

ensureChart('line');
writeLog('info', '应用启动');
