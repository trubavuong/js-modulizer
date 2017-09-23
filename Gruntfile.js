'use strict';

module.exports = function (grunt) {
    var path = require('path'),
        mochaPath = path.join('node_modules', '.bin', 'mocha'),
        _mochaPath = path.join('node_modules', 'mocha', 'bin', '_mocha'),
        istanbulPath = path.join('node_modules', '.bin', 'istanbul'),
        unitTestSpec = ' "src/js/**/*.spec.js" "test/unit/**/*.spec.js" --recursive --check-leaks --globals app --use_strict --require test/unit/helper.js -b -c ',
        e2eTestSpec = ' "test/e2e/**/*.spec.js" ',
        appName = '<%= pkg.name %>',
        appRootDir = 'dist/' + appName,
        appDir = appRootDir + '/<%= pkg.name %>',
        archiveFileName = appRootDir + '-<%= pkg.version %>.zip',
        outputJsFileName = appDir + '/js/<%= pkg.name %>.js',
        outputJsMinFileName = appDir + '/js/<%= pkg.name %>.min.js',
        excludeJsSrc = [],
        defaultJsSrc = ['src/js/**/*.js', '!src/js/**/*.min.js', '!src/js/**/*.spec.js'],
        baseJsSrc = ['src/js/polyfill.js', 'src/js/main.js'].filter(
            function (value) {
                return excludeJsSrc.indexOf(value) === -1;
            }
        ),
        nonBaseJsSrc = defaultJsSrc.concat(
            excludeJsSrc.concat(baseJsSrc).map(function (value) {
                return '!' + value;
            })
        ),
        orderedJsSrc = baseJsSrc.concat(outputJsFileName);

    function formalizeJsSrc(src) {
        return src.replace(/^\s*('use strict'|"use strict");?/gm, '').trim();
    }

    function addTabToEachLine(src) {
        return src.replace(/^(.+)$/gm, '    $1');
    }

    // Load plugins
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-eslint');
    grunt.loadNpmTasks('grunt-shell');

    // Tasks
    grunt.registerTask('dist', [
        'clean:dist',
        'eslint:distBeforeConcat',
        'concat:dist',
        'eslint:distAfterConcat',
        'uglify:dist',
        'sass:dist',
        'cssmin:dist',
        'copy:dist'
    ]);

    grunt.registerTask('dist-debug', [
        'clean:dist',
        'eslint:distBeforeConcat',
        'concat:dist',
        'eslint:distAfterConcat',
        'uglify:distDebug',
        'sass:dist',
        'cssmin:dist',
        'copy:dist'
    ]);

    grunt.registerTask('release', [
        'dist',
        'compress:dist'
    ]);

    grunt.registerTask('concat:dist', [
        'concat:distNonBaseJsSrc',
        'concat:distBaseJsSrc',
        'concat:distMergeTemplate'
    ]);

    grunt.registerTask('eslint:distAfterConcat', [
        'eslint:distAfterConcatDefault',
        'eslint:distAfterConcatStrict'
    ]);

    grunt.registerTask('unit', ['shell:unitTest']);
    grunt.registerTask('unit-debug', ['shell:unitDebug']);
    grunt.registerTask('unit-cover', ['shell:unitCover']);
    grunt.registerTask('e2e', ['shell:e2eTest']);

    // Project configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        clean: {
            dist: {
                src: ['dist']
            }
        },

        copy: {
            dist: {
                files: [{
                    expand: true,
                    src: ['vendor/**/*', 'CHANGELOG.md'],
                    dest: appDir
                }, {
                    expand: true,
                    src: ['doc/**/*'],
                    dest: appRootDir
                }, {
                    expand: true,
                    cwd: 'src',
                    src: ['font/**/*', 'img/**/*', 'demo/**/*'],
                    dest: appDir
                }]
            }
        },

        compress: {
            options: {
                archive: archiveFileName
            },
            dist: {
                expand: true,
                cwd: 'dist',
                src: '**/*'
            }
        },

        concat: {
            distNonBaseJsSrc: {
                options: {
                    process: function (src) {
                        return formalizeJsSrc(src) + '\n';
                    }
                },
                files: [{
                    src: nonBaseJsSrc,
                    dest: outputJsFileName
                }]
            },
            distBaseJsSrc: {
                options: {
                    process: function (src, path) {
                        var s = addTabToEachLine(formalizeJsSrc(src));
                        if (path === 'src/js/main.js') {
                            s = s.replace(/\s*\/\/\s*eslint-disable-line[^\r\n\S]*/, '');
                        }
                        return s + '\n';
                    }
                },
                files: [{
                    src: orderedJsSrc,
                    dest: outputJsFileName
                }]
            },
            distMergeTemplate: {
                options: {
                    process: function (src) {
                        var outputFile = grunt.template.process(outputJsFileName),
                            appDecleration = grunt.file.read(outputFile, {
                                encoding: 'utf8'
                            });
                        return grunt.template.process(src, {
                            data: {
                                appDecleration: appDecleration
                            }
                        });
                    }
                },
                files: [{
                    // src: ['src/js/umd.js.tpl'],
                    src: ['src/js/umd-simple.js.tpl'],
                    dest: outputJsFileName
                }]
            }
        },

        cssmin: {
            options: {
                sourceMap: false
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: appDir + '/css',
                    src: ['**/*.css', '!**/*.min.css'],
                    dest: appDir + '/css',
                    ext: '.min.css',
                    filter: 'isFile'
                }]
            }
        },

        eslint: {
            options: {
                configFile: '.eslintrc'
            },
            distBeforeConcat: {
                files: [{
                    src: defaultJsSrc
                }]
            },
            distAfterConcatDefault: {
                files: [{
                    src: outputJsFileName
                }]
            },
            distAfterConcatStrict: {
                options: {
                    parserOptions: {
                        sourceType: 'script'
                    },
                    rules: {
                        strict: ['error', 'function']
                    }
                },
                files: [{
                    src: outputJsFileName
                }]
            }
        },

        sass: {
            options: {
                sourcemap: 'none',
                style: 'expanded',
                noCache: true
            },
            dist: {
                files: [{
                    src: 'src/scss/main.scss',
                    dest: appDir + '/css/<%= pkg.name %>.css'
                }]
            }
        },

        uglify: {
            options: {
                sourceMap: false,
                mangle: true
            },
            dist: {
                files: [{
                    src: outputJsFileName,
                    dest: outputJsMinFileName
                }]
            },
            distDebug: {
                options: {
                    sourceMap: true,
                    output: {
                        beautify: true
                    }
                },
                files: [{
                    src: outputJsFileName,
                    dest: outputJsMinFileName
                }]
            }
        },

        shell: {
            options: {
                execOptions: {
                    maxBuffer: 10 * 1024 * 1024
                }
            },
            unitTest: {
                command: function () {
                    return mochaPath + unitTestSpec;
                }
            },
            unitDebug: {
                command: function () {
                    return 'node-debug ' + _mochaPath + unitTestSpec;
                }
            },
            unitCover: {
                command: function () {
                    return istanbulPath + ' cover ' + _mochaPath + ' -- -R spec ' + unitTestSpec;
                }
            },
            e2eTest: {
                command: function () {
                    var browser = grunt.option('browser').trim();
                    if (browser === 'remote') {
                        browser += ' --ports 50900,50901';
                    }
                    return 'testcafe --color ' + browser + e2eTestSpec;
                }
            }
        }
    });
};
