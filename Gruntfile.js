(function () {
    'use strict';

    module.exports = function (grunt) {
        var path = require('path'),
            mocha_path = path.join('node_modules', '.bin', 'mocha'),
            _mocha_path = path.join('node_modules', 'mocha', 'bin', '_mocha'),
            istanbul_path = path.join('node_modules', '.bin', 'istanbul'),
            unit_test_spec = ' test/unit/ --recursive --check-leaks --globals app --use_strict --require test/unit/helper.js -b -c ',
            e2e_test_spec = ' test/e2e/**/*.spec.js ',
            app_name = '<%= pkg.name %>',
            app_root_dir = 'dist/' + app_name,
            app_dir = app_root_dir + '/<%= pkg.name %>',
            archive_file_name = app_root_dir + '-<%= pkg.version %>.zip',
            output_js_file_name = app_dir + '/js/<%= pkg.name %>.js',
            output_js_min_file_name = app_dir + '/js/<%= pkg.name %>.min.js',
            exclude_js_src = [],
            default_js_src = ['src/js/**/*.js', '!src/js/**/*.min.js'],
            base_js_src = ['src/js/polyfill.js', 'src/js/main.js'].filter(
                function (value) {
                    return exclude_js_src.indexOf(value) === -1;
                }
            ),
            non_base_js_src = default_js_src.concat(
                exclude_js_src.concat(base_js_src).map(function (value) {
                    return '!' + value;
                })
            ),
            ordered_js_src = base_js_src.concat(output_js_file_name);

        function formalize_js_src(src) {
            return src.replace(/^\s*('use strict'|"use strict");?/gm, '').trim();
        }

        function add_tab_to_each_line(src) {
            return src.replace(/^(.+)$/gm, '    $1');
        }

        // Load plugins
        grunt.loadNpmTasks('grunt-contrib-clean');
        grunt.loadNpmTasks('grunt-contrib-copy');
        grunt.loadNpmTasks('grunt-contrib-compress');
        grunt.loadNpmTasks('grunt-contrib-concat');
        grunt.loadNpmTasks('grunt-contrib-cssmin');
        grunt.loadNpmTasks('grunt-contrib-jshint');
        grunt.loadNpmTasks('grunt-contrib-sass');
        grunt.loadNpmTasks('grunt-contrib-uglify');
        grunt.loadNpmTasks('grunt-shell');

        // Tasks
        grunt.registerTask('dist', [
            'clean:dist',
            'jshint:dist_before_concat',
            'concat:dist',
            'jshint:dist_after_concat',
            'uglify:dist',
            'sass:dist',
            'cssmin:dist',
            'copy:dist'
        ]);
        grunt.registerTask('dist_debug', [
            'clean:dist',
            'jshint:dist_before_concat',
            'concat:dist',
            'jshint:dist_after_concat',
            'uglify:dist_debug',
            'sass:dist',
            'cssmin:dist',
            'copy:dist'
        ]);
        grunt.registerTask('release', ['dist', 'compress:dist']);
        grunt.registerTask('concat:dist', [
            'concat:dist_non_base_js_src',
            'concat:dist_base_js_src',
            'concat:dist_merge_template'
        ]);
        grunt.registerTask('jshint:dist_after_concat', [
            'jshint:dist_after_concat_default',
            'jshint:dist_after_concat_strict'
        ]);

        grunt.registerTask('unit', ['shell:unit_test']);
        grunt.registerTask('unit_debug', ['shell:unit_debug']);
        grunt.registerTask('unit_cover', ['shell:unit_cover']);
        grunt.registerTask('e2e', ['shell:e2e_test']);

        // Project configuration
        grunt.initConfig({
            pkg: grunt.file.readJSON('package.json'),

            // application entry point (src/js/main.js)
            app_name: 'app',

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
                        dest: app_dir
                    }, {
                        expand: true,
                        src: ['doc/**/*'],
                        dest: app_root_dir
                    }, {
                        expand: true,
                        cwd: 'src',
                        src: ['font/**/*', 'img/**/*', 'demo/**/*'],
                        dest: app_dir
                    }]
                }
            },

            compress: {
                options: {
                    archive: archive_file_name
                },
                dist: {
                    expand: true,
                    cwd: 'dist',
                    src: '**/*'
                }
            },

            concat: {
                dist_non_base_js_src: {
                    options: {
                        process: function (src) {
                            return formalize_js_src(src) + '\n';
                        }
                    },
                    files: [{
                        src: non_base_js_src,
                        dest: output_js_file_name
                    }]
                },
                dist_base_js_src: {
                    options: {
                        process: function (src, path) {
                            var s = add_tab_to_each_line(formalize_js_src(src));
                            if (path === 'src/js/main.js') {
                                s = s.replace(/\s*\/\*\s*jshint\s+.+\r?\n/, '\n');
                            }
                            return s + '\n';
                        }
                    },
                    files: [{
                        src: ordered_js_src,
                        dest: output_js_file_name
                    }]
                },
                dist_merge_template: {
                    options: {
                        process: function (src) {
                            var output_file = grunt.template.process(output_js_file_name),
                                app_name = grunt.template.process('<%= app_name %>'),
                                app_decleration = grunt.file.read(output_file, {
                                    encoding: 'utf8'
                                });
                            return grunt.template.process(src, {
                                data: {
                                    app_name: app_name,
                                    app_decleration: app_decleration
                                }
                            });
                        }
                    },
                    files: [{
                        // src: ['src/js/umd.js.tpl'],
                        src: ['src/js/umd-simple.js.tpl'],
                        dest: output_js_file_name
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
                        cwd: app_dir + '/css',
                        src: ['**/*.css', '!**/*.min.css'],
                        dest: app_dir + '/css',
                        ext: '.min.css',
                        filter: 'isFile'
                    }]
                }
            },

            jshint: {
                options: {
                    jshintrc: '.jshintrc'
                },
                dist_before_concat: {
                    files: [{
                        src: default_js_src
                    }]
                },
                dist_after_concat_default: {
                    files: [{
                        src: output_js_file_name
                    }]
                },
                dist_after_concat_strict: {
                    options: {
                        jshintrc: undefined,
                        strict: true
                    },
                    files: [{
                        src: output_js_file_name
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
                        dest: app_dir + '/css/<%= pkg.name %>.css'
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
                        src: output_js_file_name,
                        dest: output_js_min_file_name
                    }]
                },
                dist_debug: {
                    options: {
                        sourceMap: true,
                        output: {
                            beautify: true
                        }
                    },
                    files: [{
                        src: output_js_file_name,
                        dest: output_js_min_file_name
                    }]
                }
            },

            shell: {
                options: {
                    execOptions: {
                        maxBuffer: 10 * 1024 * 1024
                    }
                },
                unit_test: {
                    command: function () {
                        return mocha_path + unit_test_spec;
                    }
                },
                unit_debug: {
                    command: function () {
                        return 'node-debug ' + _mocha_path + unit_test_spec;
                    }
                },
                unit_cover: {
                    command: function () {
                        return istanbul_path + ' cover ' + _mocha_path + ' -- -R spec ' + unit_test_spec;
                    }
                },
                e2e_test: {
                    command: function () {
                        var browser = grunt.option('browser').trim();
                        if (browser === 'remote') {
                            browser += ' --ports 50900,50901';
                        }
                        return 'testcafe --color ' + browser + e2e_test_spec;
                    }
                }
            }
        });
    };

}());
