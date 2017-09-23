'use strict';

// create 'window' entry point
global.window = global;

module.exports = global.helper = (function () {
    var path = require('path'),
        rootPath = '../../dist/js-modulizer/js-modulizer',
        appPath = path.join(rootPath, 'js/js-modulizer.min.js');

    return {
        rootPath: rootPath,
        appPath: appPath,

        loadApp: function () {
            window.app = require(this.appPath);
        },
        unloadApp: function () {
            delete window.app;
            delete require.cache[require.resolve(this.appPath)];
        }
    };
}());
