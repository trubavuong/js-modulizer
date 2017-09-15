// ------------------------------------------------------------------
// Setup application entry point.
// ------------------------------------------------------------------

var APP_NAME = '<%= entry_point %>',
    current_app = window[APP_NAME],
    new_app = (function () {
        var MODULE_STATUS = {
                NONE: 0,
                LOADING: 'loading...',
                LOADED: 'ok'
            },
            modules = {},
            module_id = 0;

        /**
         * Module getter/setter.
         *
         * If handler is omitted, returns registered module.
         * If handler is a function, returned value of function execution will be
         * module value. Otherwise, it's also module value immediately.
         *
         * Usage:
         *     // setter
         *     app.module('constants', {
         *         X: 1,
         *         Y: 2
         *     });
         *
         *     // setter
         *     app.module('width', function () {
         *         var constants = app.module('constants'); // getter
         *         return constants.X * 100;
         *     });
         *
         * @param  {String} name    module name
         * @param  {*}      handler function or anything else
         * @return {*}              module for getter
         */
        function module(name, handler) {
            var is_registered = name in modules,
                mod;
            // getter
            if (handler === undefined) {
                if (!is_registered) {
                    throw new Error('Module "' + name + '" could not be found');
                }

                // not loaded module
                mod = modules[name];
                if (mod.status === MODULE_STATUS.NONE) {
                    // mark it's loading
                    module_id += 1;
                    mod.id = module_id;
                    mod.status = MODULE_STATUS.LOADING;

                    // then mark it's loaded
                    mod.value = mod.value();
                    mod.status = MODULE_STATUS.LOADED;
                }
                // try to load 'not loaded' module again => circular dependencies
                else if (mod.status === MODULE_STATUS.LOADING) {
                    // print stack trace
                    var modules_list = [],
                        stack = '',
                        module_name,
                        module,
                        i;

                    for (module_name in modules) {
                        mod = modules[module_name];
                        if (mod.status !== MODULE_STATUS.NONE) {
                            modules_list.push(modules[module_name]);
                        }
                    }

                    modules_list.sort(function (m1, m2) {
                        if (m1.id === m2.id) {
                            return 0;
                        }
                        if (m1.id < m2.id) {
                            return -1;
                        }
                        return 1;
                    });
                    modules_list.push(mod);

                    for (i = 0; i < modules_list.length; i += 1) {
                        module = modules_list[i];
                        stack += module.id + '. (' + module.name + ' => ' + module.status + ')\n';
                    }

                    throw new Error('Circular dependencies could not be resolved while loading module "' +
                        name + '".\n\nLoading modules information:\n' + stack);
                }
                return mod.value;
            }
            // setter
            else {
                if (is_registered) {
                    throw new Error('Module "' + name + '" had been already registered');
                }

                mod = modules[name] = {
                    name: name,
                    status: typeof handler === 'function' ? MODULE_STATUS.NONE : MODULE_STATUS.LOADED,
                    value: handler
                };

                if (mod.status === MODULE_STATUS.LOADED) {
                    module_id += 1;
                    mod.id = module_id;
                }
            }
        }

        return {
            module: module
        };
    }()),
    prop;

// current app exists
if (current_app) {
    console.warn('App name "' + APP_NAME + '" exists');
    // merge new app to current app
    for (prop in new_app) {
        current_app[prop] = new_app[prop];
    }
}
else {
    window[APP_NAME] = new_app;
}

// ------------------------------------------------------------------
// Modules.
// ------------------------------------------------------------------
