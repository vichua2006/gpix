const { app } = require('electron');
const keytar = require('keytar');

const SERVICE_NAME = 'gpix';
const ACCOUNT_NAME = 'gemini-api-key';

async function getApiKey() {
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/c32de97a-f444-4ff3-ae58-a27bcdf59522',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'secure-store.js:getApiKey:entry',message:'getApiKey called',data:{isPackaged:app.isPackaged,serviceName:SERVICE_NAME,accountName:ACCOUNT_NAME},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A,B,C'})}).catch(()=>{});
  // #endregion

  let storedKey = null;
  let keytarError = null;
  try {
    storedKey = await keytar.getPassword(SERVICE_NAME, ACCOUNT_NAME);
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/c32de97a-f444-4ff3-ae58-a27bcdf59522',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'secure-store.js:getApiKey:keytarResult',message:'keytar.getPassword result',data:{hasStoredKey:!!storedKey,storedKeyLength:storedKey?storedKey.length:0,storedKeyTrimmedEmpty:storedKey?!storedKey.trim():true},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B,C,D'})}).catch(()=>{});
    // #endregion
  } catch (err) {
    keytarError = err;
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/c32de97a-f444-4ff3-ae58-a27bcdf59522',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'secure-store.js:getApiKey:keytarError',message:'keytar.getPassword threw error',data:{errorMessage:err.message,errorName:err.name,errorStack:err.stack},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B,E'})}).catch(()=>{});
    // #endregion
  }

  if (storedKey && storedKey.trim()) {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/c32de97a-f444-4ff3-ae58-a27bcdf59522',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'secure-store.js:getApiKey:returnKeytar',message:'Returning key from keytar',data:{keyLength:storedKey.trim().length},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'C,D'})}).catch(()=>{});
    // #endregion
    return storedKey.trim();
  }

  const envKey = process.env.GEMINI_API_KEY;
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/c32de97a-f444-4ff3-ae58-a27bcdf59522',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'secure-store.js:getApiKey:envCheck',message:'Checking env fallback',data:{isPackaged:app.isPackaged,hasEnvKey:!!envKey,envKeyLength:envKey?envKey.length:0,willUseEnvFallback:!app.isPackaged&&envKey&&envKey.trim()},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(()=>{});
  // #endregion

  if (!app.isPackaged && envKey && envKey.trim()) {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/c32de97a-f444-4ff3-ae58-a27bcdf59522',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'secure-store.js:getApiKey:returnEnv',message:'Returning key from env',data:{keyLength:envKey.trim().length},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    return envKey.trim();
  }

  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/c32de97a-f444-4ff3-ae58-a27bcdf59522',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'secure-store.js:getApiKey:returnNull',message:'No API key found, returning null',data:{keytarFailed:!!keytarError,isPackaged:app.isPackaged},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A,B,C,D,E'})}).catch(()=>{});
  // #endregion
  return null;
}

async function setApiKey(apiKey) {
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/c32de97a-f444-4ff3-ae58-a27bcdf59522',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'secure-store.js:setApiKey:entry',message:'setApiKey called',data:{hasApiKey:!!apiKey,apiKeyLength:apiKey?apiKey.length:0,isPackaged:app.isPackaged},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'D'})}).catch(()=>{});
  // #endregion

  if (!apiKey || typeof apiKey !== 'string' || !apiKey.trim()) {
    throw new Error('API key must be a non-empty string');
  }

  try {
    await keytar.setPassword(SERVICE_NAME, ACCOUNT_NAME, apiKey.trim());
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/c32de97a-f444-4ff3-ae58-a27bcdf59522',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'secure-store.js:setApiKey:success',message:'keytar.setPassword succeeded',data:{keyLength:apiKey.trim().length},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
  } catch (err) {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/c32de97a-f444-4ff3-ae58-a27bcdf59522',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'secure-store.js:setApiKey:error',message:'keytar.setPassword failed',data:{errorMessage:err.message,errorName:err.name},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B,D'})}).catch(()=>{});
    // #endregion
    throw err;
  }
}

async function deleteApiKey() {
  await keytar.deletePassword(SERVICE_NAME, ACCOUNT_NAME);
}

module.exports = {
  getApiKey,
  setApiKey,
  deleteApiKey
};
