(function (root, factory) {
    var APP_NAME = 'app';

    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['jquery', 'underscore'], function ($, _) {
            return (root[APP_NAME] = factory($, _));
        });
    }
    else if (module && typeof module === 'object' && module.exports && typeof module.exports === 'object') {
        // CommonJS
        module.exports = (root[APP_NAME] = factory(require('jquery'), require('underscore')));
    }
    else {
        // Browser
        root[APP_NAME] = factory(root.jQuery, root._);
    }
}(this, function ($, _) {
    return {};
}));
