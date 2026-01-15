const { contextBridge, ipcRenderer } = require('electron');
const path = require('path');
const { createRequire } = require('module');

const appRoot = path.resolve(__dirname, '..', '..');
const appRequire = createRequire(path.join(appRoot, 'package.json'));

let React;
let ReactDOMClient;
let ReactDOMLegacy;

try {
  React = appRequire('react');
  ReactDOMClient = appRequire('react-dom/client');
  ReactDOMLegacy = appRequire('react-dom');
} catch (error) {
  React = require('react');
  ReactDOMClient = require('react-dom/client');
  ReactDOMLegacy = require('react-dom');
}

contextBridge.exposeInMainWorld('settingsAPI', {
  getApiKey: () => ipcRenderer.invoke('settings-get-key'),
  saveApiKey: (apiKey) => ipcRenderer.invoke('settings-save-key', apiKey),
  clearApiKey: () => ipcRenderer.invoke('settings-clear-key'),
  quitApp: () => ipcRenderer.send('settings-quit-app')
});

contextBridge.exposeInMainWorld('settingsReact', {
  React,
  ReactDOMClient,
  ReactDOMLegacy
});
