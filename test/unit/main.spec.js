describe('app', function () {
    var expect = require('chai').expect,
        helper = require('./helper'),
        module_name = 'module';

    beforeEach(function () {
        helper.load_app();
    });

    afterEach(function () {
        helper.unload_app();
    });

    describe('module()', function () {
        describe('getter', function () {
            it('should throw an error if module does not exist', function () {
                expect(function () {
                    app.module(module_name);
                }).to.throw(module_name);
            });

            it('should return correct module', function () {
                var obj1 = {
                        a: 1,
                        b: 2,
                        c: 3
                    },
                    obj2;
                app.module(module_name, function () {
                    return obj1;
                });
                obj2 = app.module(module_name);
                expect(obj1).to.deep.equal(obj2);
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
                    app.module(module_name, function () {});
                }).to.not.throw();
            });

            it('should throw an error if module exists', function () {
                app.module(module_name, function () {});
                expect(function () {
                    app.module(module_name, function () {});
                }).to.throw(module_name);
            });
        });
    });
});
