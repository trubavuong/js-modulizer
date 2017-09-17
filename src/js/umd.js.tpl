(function (root, factory) {
    'use strict';

    // Change app name to anything to use as global entry point
    var APP_NAME = '<%= app_name %>';

    function execute_factory() {
        if (APP_NAME in root) {
            console.warn('App name "' + APP_NAME + '" exists');
        }
        return (root[APP_NAME] = factory());
    }

    if (typeof define === 'function' && define.amd) {
        // AMD
        define(execute_factory);
    }
    else if (typeof module === 'object' && module.exports) {
        // CommonJS
        module.exports = execute_factory();
    }
    else {
        // Browser
        execute_factory();
    }

}(typeof global !== 'undefined' ? global : (this.window || this.global), function () {
    'use strict';

<%= app_decleration %>
    return app;

}));
