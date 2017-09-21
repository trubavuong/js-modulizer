'use strict';

describe('app', function () {
    var expect = require('chai').expect,
        moduleName = 'module';

    beforeEach(function () {
        helper.loadApp();
    });

    afterEach(function () {
        helper.unloadApp();
    });

    describe('application entry point', function () {
        it('should create application entry point', function () {
            expect(app).to.be.an('object');
            expect(app).to.equal(window.app);
        });
    });

    describe('module()', function () {
        describe('getter', function () {
            it('should throw an error if module does not exist', function () {
                expect(function () {
                    app.module(moduleName);
                }).to.throw(moduleName);
            });

            it('should return correct module', function () {
                var obj1 = {
                        a: 1,
                        b: 2,
                        c: 3
                    },
                    obj2;
                app.module(moduleName, function () {
                    return obj1;
                });
                obj2 = app.module(moduleName);
                expect(obj1).to.equal(obj2);
            });

            describe('circular dependencies', function () {
                it('should throw an error for simple circular dependencies case', function () {
                    app.module('1', function () {
                        app.module('2');
                        return {};
                    });

                    app.module('2', function () {
                        app.module('1');
                        return {};
                    });

                    expect(function () {
                        app.module('1');
                    }).to.throw('Circular dependencies');
                });

                it('should throw an error for complex circular dependencies case', function () {
                    app.module('1', function () {
                        app.module('2');
                        return {};
                    });

                    app.module('2', function () {
                        app.module('3');
                        return {};
                    });

                    app.module('3', function () {
                        app.module('4');
                        return {};
                    });

                    app.module('4', function () {
                        app.module('2');
                        return {};
                    });

                    expect(function () {
                        app.module('1');
                    }).to.throw('Circular dependencies');
                });
            });
        });

        describe('setter', function () {
            it('should not throw an error if module does not exists', function () {
                expect(function () {
                    app.module(moduleName, function () {});
                }).to.not.throw();
            });

            it('should throw an error if module exists', function () {
                app.module(moduleName, function () {});
                expect(function () {
                    app.module(moduleName, function () {});
                }).to.throw(moduleName);
            });

            it('should work with non-function param', function () {
                var value = 1000;
                app.module(moduleName, value);
                expect(app.module(moduleName)).to.equal(value);
            });
        });
    });
});
