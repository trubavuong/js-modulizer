// create 'window' entry point
global.window = global;

module.exports = {
    _app_path: '../../dist/js-modulizer/js-modulizer/js/js-modulizer.min.js',

    load_app: function () {
        require(this._app_path);
    },
    unload_app: function () {
        delete window.app;
        delete require.cache[require.resolve(this._app_path)];
    }
};
