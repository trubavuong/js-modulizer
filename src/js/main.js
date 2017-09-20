// ------------------------------------------------------------------
// Setup application entry point.
// ------------------------------------------------------------------

var app = (function () { // eslint-disable-line
    var MODULE_STATUS = {
            NONE: 0,
            LOADING: 'loading...',
            LOADED: 'ok'
        },
        modules = {},
        moduleId = 0;

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
        var isRegistered = name in modules,
            mod;
        // getter
        if (handler === undefined) {
            if (!isRegistered) {
                throw new Error('Module "' + name + '" could not be found');
            }

            // not loaded module
            mod = modules[name];
            if (mod.status === MODULE_STATUS.NONE) {
                // mark it's loading
                moduleId += 1;
                mod.id = moduleId;
                mod.status = MODULE_STATUS.LOADING;

                // then mark it's loaded
                mod.value = mod.value();
                mod.status = MODULE_STATUS.LOADED;
            }
            // try to load 'not loaded' module again => circular dependencies
            else if (mod.status === MODULE_STATUS.LOADING) {
                // print stack trace
                var usedModules = [],
                    stack = '',
                    moduleName,
                    module,
                    i;

                for (moduleName in modules) {
                    mod = modules[moduleName];
                    if (mod.status !== MODULE_STATUS.NONE) {
                        usedModules.push(modules[moduleName]);
                    }
                }

                usedModules.sort(function (m1, m2) {
                    if (m1.id === m2.id) {
                        return 0;
                    }
                    if (m1.id < m2.id) {
                        return -1;
                    }
                    return 1;
                });
                usedModules.push(mod);

                for (i = 0; i < usedModules.length; i += 1) {
                    module = usedModules[i];
                    stack += module.id + '. (' + module.name + ' => ' + module.status + ')\n';
                }

                throw new Error('Circular dependencies could not be resolved while loading module "' +
                    name + '".\n\nLoading modules information:\n' + stack);
            }
            return mod.value;
        }
        // setter
        else {
            if (isRegistered) {
                throw new Error('Module "' + name + '" had been already registered');
            }

            mod = modules[name] = {
                name: name,
                status: typeof handler === 'function' ? MODULE_STATUS.NONE : MODULE_STATUS.LOADED,
                value: handler
            };

            if (mod.status === MODULE_STATUS.LOADED) {
                moduleId += 1;
                mod.id = moduleId;
            }
        }
    }

    return {
        module: module
    };
}());

// ------------------------------------------------------------------
// Modules.
// ------------------------------------------------------------------
