// create 'window' entry point
global.window = global;

module.exports = global.helper = {
    _appPath: '../../dist/js-modulizer/js-modulizer/js/js-modulizer.min.js',

    loadApp: function () {
        window.app = require(this._appPath);
    },
    unloadApp: function () {
        delete window.app;
        delete require.cache[require.resolve(this._appPath)];
    }
};
