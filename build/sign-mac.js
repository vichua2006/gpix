// Use electron-builder's existing signing dependency, including nested installs.
const { signAsync } = require(require.resolve('@electron/osx-sign', {
  paths: [require.resolve('app-builder-lib')]
}));

module.exports = async (options) => {
  if (options.identity) {
    return signAsync(options);
  }

  // Ad-hoc signing supports Apple Silicon without an Apple certificate.
  // It does not establish publisher identity or satisfy Gatekeeper.
  return signAsync({
    ...options,
    identity: '-',
    preAutoEntitlements: false,
    optionsForFile: (file) => ({
      ...options.optionsForFile(file),
      hardenedRuntime: false
    })
  });
};
