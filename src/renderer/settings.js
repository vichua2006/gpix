const { ipcRenderer } = require('electron');
const React = require('react');
const ReactDOMClient = require('react-dom/client');
const ReactDOMLegacy = require('react-dom');
const { useEffect, useState } = React;

function SettingsApp() {
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    ipcRenderer.invoke('settings-get-key').then((storedKey) => {
      if (isMounted) {
        setApiKey(storedKey || '');
      }
    }).catch((error) => {
      if (isMounted) {
        setStatus(error.message || 'Failed to load API key.');
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSave = async () => {
    if (!apiKey.trim()) {
      setStatus('Please enter a valid API key.');
      return;
    }
    setLoading(true);
    setStatus('Saving...');
    try {
      await ipcRenderer.invoke('settings-save-key', apiKey.trim());
      setStatus('API key saved.');
    } catch (error) {
      setStatus(error.message || 'Failed to save API key.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    setLoading(true);
    setStatus('Clearing...');
    try {
      await ipcRenderer.invoke('settings-clear-key');
      setApiKey('');
      setStatus('API key removed.');
    } catch (error) {
      setStatus(error.message || 'Failed to clear API key.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuit = () => {
    ipcRenderer.send('settings-quit-app');
  };

  return React.createElement(
    'div',
    { className: 'card' },
    React.createElement('h1', { className: 'title' }, 'gpix settings'),
    React.createElement(
      'p',
      { className: 'subtitle' },
      'Store your Gemini API key securely in the system keychain.'
    ),
    React.createElement(
      'div',
      { className: 'field' },
      React.createElement('label', { htmlFor: 'apiKey' }, 'Gemini API key'),
      React.createElement('input', {
        id: 'apiKey',
        type: 'password',
        placeholder: 'Enter your key',
        value: apiKey,
        onChange: (event) => setApiKey(event.target.value),
        autoComplete: 'off'
      })
    ),
    React.createElement(
      'div',
      { className: 'actions' },
      React.createElement(
        'button',
        { className: 'primary', onClick: handleSave, disabled: loading },
        'Save key'
      ),
      React.createElement(
        'button',
        { className: 'ghost', onClick: handleClear, disabled: loading },
        'Delete key'
      ),
      React.createElement(
        'button',
        { className: 'danger', onClick: handleQuit },
        'Quit app'
      )
    ),
    React.createElement('div', { className: 'status' }, status)
  );
}

const rootElement = document.getElementById('root');
if (ReactDOMClient && ReactDOMClient.createRoot) {
  const root = ReactDOMClient.createRoot(rootElement);
  root.render(React.createElement(SettingsApp));
} else {
  ReactDOMLegacy.render(React.createElement(SettingsApp), rootElement);
}
