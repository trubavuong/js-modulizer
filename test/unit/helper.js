// create 'window' entry point
global.window = global;

module.exports = global.helper = {
    _app_path: '../../dist/js-modulizer/js-modulizer/js/js-modulizer.min.js',

    load_app: function () {
        window.app = require(this._app_path);
    },
    unload_app: function () {
        delete window.app;
        delete require.cache[require.resolve(this._app_path)];
    }
};
