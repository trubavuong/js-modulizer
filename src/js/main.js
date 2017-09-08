// ------------------------------------------------------------------
// Setup application entry point.
// ------------------------------------------------------------------

var APP_NAME = '<%= entry_point %>',
    current_app = window[APP_NAME],
    new_app = (function () {
        var registered_modules = {},
            executed_modules = {},
            module_id = 0;

        function module(name, handler) {
            var is_registered = name in registered_modules;
            // getter
            if (handler === undefined) {
                if (!is_registered) {
                    throw new Error('Module "' + name + '" could not be found');
                }

                // not executed module
                if (!(name in executed_modules)) {
                    // mark it's loading
                    module_id += 1;
                    executed_modules[name] = {
                        name: name,
                        is_loaded: false,
                        id: module_id
                    };

                    // then mark it's loaded
                    executed_modules[name].value = registered_modules[name]();
                    executed_modules[name].is_loaded = true;
                }

                var module_state = executed_modules[name];
                // try to load 'not loaded' module again => circular dependencies
                if (!module_state.is_loaded) {
                    // print stack trace
                    var executed_modules_list = [],
                        stack = '',
                        module_name,
                        module,
                        i;

                    for (module_name in executed_modules) {
                        executed_modules_list.push(executed_modules[module_name]);
                    }

                    executed_modules_list.sort(function (m1, m2) {
                        if (m1.id === m2.id) {
                            return 0;
                        }
                        if (m1.id < m2.id) {
                            return -1;
                        }
                        return 1;
                    });
                    executed_modules_list.push(module_state);

                    for (i = 0; i < executed_modules_list.length; i += 1) {
                        module = executed_modules_list[i];
                        stack += module.id + '. (' + module.name + ' => ' + (module.is_loaded ? 'ok' : 'loading...') + ')\n';
                    }

                    throw new Error('Circular dependencies could not be resolved while loading module "' +
                        name + '".\n\nLoading modules information:\n' + stack);
                }
                return module_state.value;
            }
            // setter
            else {
                if (is_registered) {
                    throw new Error('Module "' + name + '" had been already registered');
                }
                registered_modules[name] = handler;
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
