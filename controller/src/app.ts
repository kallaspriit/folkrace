if (window.app === undefined) {
  // mock the JavaScript interface provided by the Android application
  window.app = {
    getIpAddress: () => "127.0.0.1",
    showToast: _message => {
      // nothing
    },
    reload: () => window.location.reload(),
  };
}
