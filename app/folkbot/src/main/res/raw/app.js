"use strict";
if (window.app === undefined) {
    // mock the JavaScript interface provided by the Android application
    window.app = {
        getIpAddress: function () { return "127.0.0.1"; },
        showToast: function (_message) {
            // nothing
        },
        reload: function () { return window.location.reload(); },
    };
}
//# sourceMappingURL=app.js.map