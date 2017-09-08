// ------------------------------------------------------------------
// Polyfills.
// ------------------------------------------------------------------

if (typeof Array.prototype.indexOf !== 'function') {
    Array.prototype.indexOf = function (element, start_index) {
        var len = this.length,
            i;
        for (i = (start_index || 0); i < len; i += 1) {
            if (this[i] === element) {
                return i;
            }
        }
        return -1;
    };
}

if (typeof Date.now !== 'function') {
    Date.now = function () {
        return new Date().getTime();
    };
}
