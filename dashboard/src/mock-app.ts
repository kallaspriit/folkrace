if (window.app === undefined) {
  window.app = {
    getIpAddress: () => "10.220.20.47", // TODO: how to handle this?
    showToast: _message => {
      // nothing
    },
    reload: () => window.location.reload(),
  };
}
