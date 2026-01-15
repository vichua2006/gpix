const { app } = require('electron');
const keytar = require('keytar');

const SERVICE_NAME = 'gpix';
const ACCOUNT_NAME = 'gemini-api-key';

async function getApiKey() {
  const storedKey = await keytar.getPassword(SERVICE_NAME, ACCOUNT_NAME);
  if (storedKey && storedKey.trim()) {
    return storedKey.trim();
  }

  const envKey = process.env.GEMINI_API_KEY;
  if (!app.isPackaged && envKey && envKey.trim()) {
    return envKey.trim();
  }

  return null;
}

async function setApiKey(apiKey) {
  if (!apiKey || typeof apiKey !== 'string' || !apiKey.trim()) {
    throw new Error('API key must be a non-empty string');
  }

  await keytar.setPassword(SERVICE_NAME, ACCOUNT_NAME, apiKey.trim());
}

async function deleteApiKey() {
  await keytar.deletePassword(SERVICE_NAME, ACCOUNT_NAME);
}

module.exports = {
  getApiKey,
  setApiKey,
  deleteApiKey
};
