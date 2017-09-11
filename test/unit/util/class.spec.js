describe('util.class', function () {
    var expect = require('chai').expect,
        helper = require('../helper'),
        Class;

    beforeEach(function () {
        helper.load_app();
        Class = app.module('util.class');
    });

    afterEach(function () {
        helper.unload_app();
    });

    describe('Class', function () {
        it('should create a class correctly', function () {
            var Person = Class({
                    $constructor: function (name) {
                        this.name = name;
                    },
                    $static: {
                        ID: 999,
                        say: function (msg) {
                            return msg;
                        }
                    },
                    get_name: function () {
                        return name;
                    }
                }),
                name = 'Bob',
                p = new Person(name);

            expect(p.name).to.equal(name);
            expect(p.get_name()).to.equal(name);

            expect(Person.ID).to.equal(999);
            expect(Person.say(name)).to.equal(name);
            expect(Person.say('something')).to.equal('something');
        });

        it('should create inheritance correctly', function () {
            var Person = Class({
                    $constructor: function (name) {
                        this.name = name;
                    },
                    get_name: function () {
                        return name;
                    }
                }),
                Student = Class({
                    $constructor: function (name) {
                        this.$super.constructor.call(this, name);
                    },
                    $extends: Person,
                    get_long_name: function () {
                        return this.get_name() + ' plus';
                    }
                }),
                name = 'Bob',
                s = new Student(name);

            expect(s.name).to.equal(name);
            expect(s.get_name()).to.equal(name);
            expect(s.get_long_name()).to.equal(name + ' plus');
        });
    });
});
