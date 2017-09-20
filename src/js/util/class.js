app.module('util.class', function () {
    // Polyfill
    if (typeof Object.create !== 'function') {
        Object.create = function (object) {
            var F = function () {};
            F.prototype = object;
            return new F();
        };
    }

    /**
     * Usage:
     *
     * var SuperClass = Class({
     *     $constructor: function (param) {
     *         this.param = param;
     *     },
     *
     *     $static: {
     *         STATIC_VAR: 100,
     *         static_method: function () {}
     *     },
     *
     *     some_method: function (extra_param) {
     *         // use 'extra_param' and 'this.param'
     *     }
     * });
     *
     * var DerivedClass = Class({
     *     $extends: SuperClass,
     *     // $extends: [SuperClass],
     *     // $extends: [SuperClass, MixinClassA, MixinClassB],
     *     // *** support multiple inheritances:
     *     //     first class is super class, others are mixins
     *
     *     $constructor: function (param, extra_param) {
     *         // call super constructor
     *         this.$super.constructor.call(this, param);
     *         this.extra_param = extra_param;
     *     },
     *
     *     some_method: function (extra_param, extra_extra_param) {
     *         // call super method
     *         this.$super.some_method.call(this, extra_param);
     *         // use 'extra_extra_param'
     *     },
     *
     *     other_method: function (extra_param) {
     *         // use 'extra_param', 'this.param' and 'this.extra_param'
     *     }
     * })
     *
     */
    var Class = (function () {
        var RESERVED_KEYWORDS = ['$constructor', '$extends', '$static', '$super'];

        return function (objSpec) {
            var F = objSpec.$constructor ||
                function () {
                    if (this.$super) {
                        this.$super.constructor.apply(this, Array.prototype.slice.call(arguments));
                    }
                },
                prop, value, staticProp, prototype, i;

            if (objSpec.hasOwnProperty('$extends')) {
                value = objSpec.$extends;
                if (!(value instanceof Array)) {
                    value = [value];
                }
                for (i = 0; i < value.length; i += 1) {
                    prototype = value[i].prototype;
                    if (i === 0) {
                        // super class
                        F.prototype = Object.create(prototype);
                    }
                    else {
                        // mixins
                        for (prop in prototype) {
                            if (prototype.hasOwnProperty(prop) && !(prop in F.prototype)) {
                                F.prototype[prop] = prototype[prop];
                            }
                        }
                    }
                }
                F.prototype.$super = Object.create(value[0].prototype);
                F.prototype.constructor = F;
            }

            for (prop in objSpec) {
                if (objSpec.hasOwnProperty(prop)) {
                    value = objSpec[prop];
                    if (prop === '$static') {
                        for (staticProp in value) {
                            if (value.hasOwnProperty(staticProp)) {
                                F[staticProp] = value[staticProp];
                            }
                        }
                    }
                    else if (RESERVED_KEYWORDS.indexOf(prop) === -1) {
                        F.prototype[prop] = value;
                    }
                }
            }

            return F;
        };
    }());

    return Class;
});
