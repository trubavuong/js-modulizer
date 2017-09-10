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
     *     $$constructor: function (param) {
     *         this.param = param;
     *     },
     *
     *     $$static: {
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
     *     $$extends: SuperClass,
     *
     *     $$constructor: function (param, extra_param) {
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
        var RESERVED_KEYWORDS = ['$$constructor', '$$extends', '$$static'];

        return function (obj_spec) {
            var F = obj_spec.$$constructor || function () {},
                prop, value, static_prop;

            if (obj_spec.hasOwnProperty('$$extends')) {
                value = obj_spec.$$extends;
                F.prototype = Object.create(value.prototype);
                F.prototype.$super = Object.create(value.prototype);
                F.prototype.constructor = F;
            }

            for (prop in obj_spec) {
                if (obj_spec.hasOwnProperty(prop)) {
                    value = obj_spec[prop];
                    if (prop === '$$static') {
                        for (static_prop in value) {
                            if (value.hasOwnProperty(static_prop)) {
                                F[static_prop] = value[static_prop];
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