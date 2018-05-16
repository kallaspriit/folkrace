if (window.app === undefined) {
  // mock the JavaScript interface provided by the Android application
  window.app = {
    getIpAddress: () => "10.220.20.47", // TODO: how to handle this?
    showToast: _message => {
      // nothing
    },
    reload: () => window.location.reload(),
  };
}
