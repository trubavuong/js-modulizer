'use strict';

describe('util.class', function () {
    var expect = require('chai').expect,
        Class;

    beforeEach(function () {
        helper.loadApp();
        Class = app.module('util.class');
    });

    afterEach(function () {
        helper.unloadApp();
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
                    getName: function () {
                        return this.name;
                    }
                }),
                name = 'Bob',
                p = new Person(name);

            expect(p.name).to.equal(name);
            expect(p.getName()).to.equal(name);

            expect(Person.ID).to.equal(999);
            expect(Person.say(name)).to.equal(name);
            expect(Person.say('something')).to.equal('something');
        });

        it('should support inheritance correctly', function () {
            var Person = Class({
                    $constructor: function (name) {
                        this.name = name;
                    },
                    getName: function () {
                        return this.name;
                    }
                }),
                Student = Class({
                    $constructor: function (name) {
                        this.$super.constructor.call(this, name);
                    },
                    $extends: Person,
                    getLongName: function () {
                        return this.getName() + ' plus';
                    }
                }),
                name = 'Bob',
                s = new Student(name);

            expect(s.name).to.equal(name);
            expect(s.getName()).to.equal(name);
            expect(s.getLongName()).to.equal(name + ' plus');
        });

        it('should support inheritance with overridden method correctly', function () {
            var Person = Class({
                    $constructor: function (name) {
                        this.name = name;
                    },
                    getName: function () {
                        return this.name;
                    }
                }),
                Student = Class({
                    $constructor: function (name) {
                        this.$super.constructor.call(this, name);
                    },
                    $extends: Person,
                    getName: function () {
                        return this.$super.getName.call(this) + ' wrapper';
                    },
                    getLongName: function () {
                        return this.getName() + ' plus';
                    }
                }),
                name = 'Bob',
                s = new Student(name);

            expect(s.name).to.equal(name);
            expect(s.getName()).to.equal(name + ' wrapper');
            expect(s.getLongName()).to.equal(name + ' wrapper plus');
        });

        it('should support inheritance with default constructor correctly', function () {
            var Person = Class({
                    $constructor: function (name) {
                        this.name = name;
                    },
                    getName: function () {
                        return this.name;
                    }
                }),
                Student = Class({
                    $extends: [Person],
                    getLongName: function () {
                        return this.getName() + ' plus';
                    }
                }),
                name = 'Bob',
                s = new Student(name);

            expect(s.name).to.equal(name);
            expect(s.getName()).to.equal(name);
            expect(s.getLongName()).to.equal(name + ' plus');
        });

        it('should support inheritance with array style correctly', function () {
            var Person = Class({
                    $constructor: function (name) {
                        this.name = name;
                    },
                    getName: function () {
                        return this.name;
                    }
                }),
                Student = Class({
                    $constructor: function (name) {
                        this.$super.constructor.call(this, name);
                    },
                    $extends: [Person],
                    getLongName: function () {
                        return this.getName() + ' plus';
                    }
                }),
                name = 'Bob',
                s = new Student(name);

            expect(s.name).to.equal(name);
            expect(s.getName()).to.equal(name);
            expect(s.getLongName()).to.equal(name + ' plus');
        });

        it('should support multiple inheritances correctly', function () {
            var Person = Class({
                    $constructor: function (name) {
                        this.name = name;
                    },
                    getName: function () {
                        return this.name;
                    }
                }),
                Worker = Class({
                    work: function () {
                        return 'working';
                    },
                    pick: function () {
                        return 'tool';
                    }
                }),
                Humanbeing = Class({
                    $extends: Person,
                    getName: function () {
                        return 'Humanbeing';
                    },
                    pick: function () {
                        return 'nothing';
                    },
                    eat: function () {
                        return 'eating';
                    }
                }),
                Student = Class({
                    $constructor: function (name) {
                        this.$super.constructor.call(this, name);
                    },
                    $extends: [Person, Worker, Humanbeing],
                    getLongName: function () {
                        return this.getName() + ' plus';
                    }
                }),
                name = 'Bob',
                s = new Student(name);

            expect(s.name).to.equal(name);
            expect(s.getName()).to.equal(name);
            expect(s.getLongName()).to.equal(name + ' plus');
            expect(s.work()).to.equal('working');
            expect(s.pick()).to.equal('tool');
            expect(s.eat()).to.equal('eating');
        });
    });
});
