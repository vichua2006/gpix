const { ipcRenderer } = require('electron');
const React = require('react');
const ReactDOMClient = require('react-dom/client');
const ReactDOMLegacy = require('react-dom');
const { useEffect, useState, useCallback } = React;

function SettingsApp() {
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null); // null, 'checking', 'valid', 'invalid'
  const [connectionError, setConnectionError] = useState('');

  const testApiKey = useCallback(async (keyToTest) => {
    if (!keyToTest || !keyToTest.trim()) {
      setConnectionStatus(null);
      setConnectionError('');
      return;
    }

    setConnectionStatus('checking');
    setConnectionError('');

    try {
      const result = await ipcRenderer.invoke('settings-test-key', keyToTest);
      if (result.success) {
        setConnectionStatus('valid');
        setConnectionError('');
      } else {
        setConnectionStatus('invalid');
        setConnectionError(result.error || 'Invalid API key');
      }
    } catch (error) {
      setConnectionStatus('invalid');
      setConnectionError(error.message || 'Connection test failed');
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    ipcRenderer.invoke('settings-get-key').then((storedKey) => {
      if (isMounted) {
        setApiKey(storedKey || '');
        // Test API key on startup if one exists
        if (storedKey) {
          testApiKey(storedKey);
        }
      }
    }).catch((error) => {
      if (isMounted) {
        setStatus(error.message || 'Failed to load API key.');
      }
    });

    return () => {
      isMounted = false;
    };
  }, [testApiKey]);

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

  // Eye icon SVGs
  const EyeIcon = React.createElement('svg', {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  },
    React.createElement('path', { d: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z' }),
    React.createElement('circle', { cx: 12, cy: 12, r: 3 })
  );

  const EyeOffIcon = React.createElement('svg', {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  },
    React.createElement('path', { d: 'M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24' }),
    React.createElement('line', { x1: 1, y1: 1, x2: 23, y2: 23 })
  );

  // Connection status indicator
  const getConnectionIndicator = () => {
    if (connectionStatus === 'checking') {
      return React.createElement('span', { className: 'connection-status checking' }, 'Checking...');
    } else if (connectionStatus === 'valid') {
      return React.createElement('span', { className: 'connection-status valid' }, '✓ Valid');
    } else if (connectionStatus === 'invalid') {
      return React.createElement('span', { className: 'connection-status invalid', title: connectionError }, '✗ Invalid');
    }
    return null;
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
      React.createElement(
        'div',
        { className: 'label-row' },
        React.createElement('label', { htmlFor: 'apiKey' }, 'Gemini API key'),
        getConnectionIndicator()
      ),
      React.createElement(
        'div',
        { className: 'input-wrapper' },
        React.createElement('input', {
          id: 'apiKey',
          type: showApiKey ? 'text' : 'password',
          placeholder: 'Enter your key',
          value: apiKey,
          onChange: (event) => setApiKey(event.target.value),
          autoComplete: 'off'
        }),
        React.createElement(
          'button',
          {
            type: 'button',
            className: 'eye-toggle',
            onClick: () => setShowApiKey(!showApiKey),
            title: showApiKey ? 'Hide API key' : 'Show API key',
            tabIndex: -1
          },
          showApiKey ? EyeOffIcon : EyeIcon
        )
      )
    ),
    React.createElement(
      'div',
      { className: 'shortcut-info' },
      React.createElement('label', null, 'Global shortcut'),
      React.createElement(
        'p',
        { className: 'shortcut-desc' },
        'Press ',
        React.createElement('kbd', null, 'Ctrl'),
        ' + ',
        React.createElement('kbd', null, 'Shift'),
        ' + ',
        React.createElement('kbd', null, 'S'),
        ' anywhere to capture and convert an equation to LaTeX.'
      )
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
        { className: 'danger', onClick: handleQuit },
        'Quit app'
      ),
      React.createElement(
        'button',
        { className: 'ghost', onClick: () => testApiKey(apiKey), disabled: loading || connectionStatus === 'checking' || !apiKey.trim() },
        'Test key'
      ),
      React.createElement(
        'button',
        { className: 'ghost', onClick: handleClear, disabled: loading },
        'Delete key'
      )
    ),
    React.createElement('div', { className: 'status' }, connectionStatus === 'invalid' && connectionError ? connectionError : status)
  );
}

const rootElement = document.getElementById('root');
if (ReactDOMClient && ReactDOMClient.createRoot) {
  const root = ReactDOMClient.createRoot(rootElement);
  root.render(React.createElement(SettingsApp));
} else {
  ReactDOMLegacy.render(React.createElement(SettingsApp), rootElement);
}
