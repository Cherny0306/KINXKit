const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { pathToFileURL } = require('url');
const fs = require('fs/promises');

const distDir = path.join(__dirname, '..', 'dist');
let logDir = path.join(app.getPath('userData'), 'logs');

function importModule(rel) {
  const p = path.join(distDir, rel);
  return import(pathToFileURL(p).href);
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: { preload: path.join(__dirname, 'preload.js') }
  });
  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });

function formatDate(d = new Date()) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

ipcMain.handle('env:detect', async () => {
  const { EnvironmentDetector } = await importModule('core/detector.js');
  const det = new EnvironmentDetector();
  return det.detect();
});

ipcMain.handle('project:create', async (_e, payload) => {
  const { CodeGenerator } = await importModule('core/generator.js');
  const { ProjectType } = await importModule('types.js');
  const gen = new CodeGenerator();
  const typeMap = {
    ai_chatbot: ProjectType.AI_CHATBOT,
    api_service: ProjectType.API_SERVICE,
    web_app: ProjectType.WEB_APP,
    utility: ProjectType.UTILITY
  };
  const type = typeMap[payload.type] || ProjectType.AI_CHATBOT;
  await gen.generate(type, {
    name: payload.name,
    path: payload.path,
    description: payload.description || `${payload.name}`,
    techStack: { backend: '', container: '', gpu: !!payload.gpu }
  });
  return { ok: true, path: payload.path };
});

ipcMain.handle('docker:up', async (_e, { projectPath, detached }) => {
  const { DockerManager } = await importModule('core/docker.js');
  const m = new DockerManager();
  const ok = await m.up(projectPath, detached !== false);
  return { ok };
});
ipcMain.handle('docker:down', async (_e, { projectPath, volumes }) => {
  const { DockerManager } = await importModule('core/docker.js');
  const m = new DockerManager();
  const ok = await m.down(projectPath, !!volumes);
  return { ok };
});
ipcMain.handle('docker:status', async (_e, { projectPath }) => {
  const { DockerManager } = await importModule('core/docker.js');
  const m = new DockerManager();
  const s = await m.status(projectPath);
  return s;
});
ipcMain.handle('fix:diagnose', async () => {
  const { IssueDetector } = await importModule('core/detector-issues.js');
  const d = new IssueDetector();
  return d.runFullDiagnostic();
});

ipcMain.handle('preset:ai', async (_e, { service, apiKey, model }) => {
  const { ConfigPresetManager } = await importModule('core/preset-manager.js');
  const mgr = new ConfigPresetManager();
  const text = await mgr.generateAIServiceConfig(service, apiKey, { model });
  await fs.writeFile('.env', text, 'utf-8');
  return { ok: true };
});

ipcMain.handle('dialog:chooseDir', async () => {
  const result = await dialog.showOpenDialog({ properties: ['openDirectory'] });
  if (result.canceled || !result.filePaths?.[0]) return null;
  return result.filePaths[0];
});

ipcMain.handle('file:saveJson', async (_e, { dirPath, fileName, data }) => {
  try {
    await fs.mkdir(dirPath, { recursive: true });
    const full = path.join(dirPath, fileName);
    await fs.writeFile(full, JSON.stringify(data, null, 2), 'utf-8');
    return { ok: true, path: full };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
});

ipcMain.handle('log:setDir', async (_e, { dirPath }) => {
  try {
    await fs.mkdir(dirPath, { recursive: true });
    logDir = dirPath;
    return { ok: true, dirPath };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
});

ipcMain.handle('log:write', async (_e, { level, message }) => {
  try {
    await fs.mkdir(logDir, { recursive: true });
    const file = path.join(logDir, `${formatDate()}.log`);
    const line = `[${new Date().toISOString()}] ${level.toUpperCase()} ${message}\n`;
    await fs.appendFile(file, line, 'utf-8');
    return { ok: true, line };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
});

ipcMain.handle('github:create', async (_e, { projectPath, name, description, privateRepo }) => {
  const { GitHubManager } = await importModule('core/github.js');
  const gh = new GitHubManager();
  const ok = await gh.createAndPush(projectPath, { name, description, private: !!privateRepo });
  return { ok };
});
