/*jshint smarttabs:true */
/*global module:false*/
module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('config/package.json'),
        meta: {
            banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
            '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
            '* https://github.com/TranscendComputing/StackStudio\n' +
            '* Copyright (c) <%= grunt.template.today("yyyy") %> ' +
            'Transcend Computing; Licensed APL2 */'
        },
        source: {
            files: ['js/interpreters/**/*.js',
            'js/models/**/*.js',
            'js/views/**/*.js',
            'js/collections/**/*.js',
            'js/aws/**/*.js',
            'js/openstack/**/*.js',
            'js/vcloud/**/*.js']
        },
        spec: {
            files: ['spec/**/*.js']
        },
        lint: {
            files: ['Gruntfile.js',
            'js/config/*.js',
            '<%= source.files %>']
        },
        concat: {
            options: {
                stripBanners: true,
                banner: '<%= meta.banner %>'
            },
            dist: {
                src: ['js/main.js', 'js/plugins.js'],
                dest: 'dist/<%= pkg.name %>.js'
            }
        },
        uglify: {
            options: {
                stripBanners: true,
                banner: '<%= meta.banner %>'
            },
            misc: {
                files: {
                    'dist/<%= pkg.name %>.min.js': ['<%= source.files %>', '<%= concat.dist.dest %>']
                }
            }
        },
        // Download some CDN assets to serve as backups (served locally as last resort)
        curl: {
            'js/vendor/require.js': 'http://cdnjs.cloudflare.com/ajax/libs/require.js/2.1.5/require.min.js',
            'js/vendor/jquery.js': 'http://ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js',
            'js/vendor/jquery.dataTables.js': 'http://ajax.aspnetcdn.com/ajax/jquery.dataTables/1.9.4/jquery.dataTables.js',
            'js/vendor/dataTables.bootstrap.js': 'https://raw.github.com/DataTables/Plugins/master/integration/bootstrap/3/dataTables.bootstrap.js',
            'css/dataTables.bootstrap.css': 'https://raw.github.com/DataTables/Plugins/master/integration/bootstrap/3/dataTables.bootstrap.css',
            'js/vendor/ace/ace.js': 'https://github.com/ajaxorg/ace-builds/blob/master/src-min/ace.js',
            'js/vendor/backbone.js': 'http://cdnjs.cloudflare.com/ajax/libs/backbone.js/1.0.0/backbone-min.js',
            'js/vendor/lodash.js': 'http://cdnjs.cloudflare.com/ajax/libs/lodash.js/1.1.0/lodash.min.js',
            'js/vendor/jquery-ui.js': 'http://ajax.googleapis.com/ajax/libs/jqueryui/1.10.4/jquery-ui.min.js',
            'js/vendor/jquery.jstree.js': 'http://cdn.jsdelivr.net/jquery.jstree/pre1.0/jquery.jstree.js',
            'js/vendor/jquery.terminal.js': 'http://cdn.jsdelivr.net/jquery.terminal/0.7.8/jquery.terminal-min.js',
            'js/vendor/ICanHaz.js': 'https://raw.github.com/HenrikJoreteg/ICanHaz.js/master/ICanHaz.js',
            'js/vendor/twitter/typeahead.js': 'http://cdn.jsdelivr.net/typeahead.js/0.9.3/typeahead.min.js',
            'js/vendor/URI/URI.js': 'http://cdn.jsdelivr.net/uri.js/1.10.2/URI.js',
            'js/vendor/URI/punycode.js': 'http://cdn.jsdelivr.net/uri.js/1.10.2/punycode.js',
            'js/vendor/URI/IPv6.js': 'http://cdn.jsdelivr.net/uri.js/1.10.2/IPv6.js',
            'js/vendor/URI/SecondLevelDomains.js': 'http://cdn.jsdelivr.net/uri.js/1.10.2/SecondLevelDomains.js'
        },
        clean: ['js/vendor/require.js',
            'js/vendor/jquery.js',
            'js/vendor/jquery.dataTables.js',
            'js/vendor/ace/ace.js',
            'js/vendor/backbone.js',
            'js/vendor/lodash.js',
            'js/vendor/jquery-ui.js',
            'js/vendor/jquery.jstree.js',
            'js/vendor/jquery.terminal.js',
            'js/vendor/ICanHaz.js',
            'js/vendor/twitter/typeahead.js',
            'js/vendor/URI/URI.js',
            'js/vendor/URI/punycode.js',
            'js/vendor/URI/IPv6.js',
            'js/vendor/URI/SecondLevelDomains.js'
        ],
        watch: {
            files: '<%= lint.files %>',
            tasks: 'default'
        },
        jshint: {
            options: {
                curly: true,
                eqeqeq: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                sub: true,
                undef: true,
                boss: true,
                eqnull: true,
                browser: true,
                smarttabs: true,
                devel:true,
                expr: true,
                globals: {
                    jQuery: true,
                    console: true,
                    require: true,
                    requirejs: true
                }
            },
            source_files: '<%= lint.files %>',
            spec_files: {
                options: {
                    jshintrc: 'spec/.jshintrc'
                },
                files: {
                    src: '<%= spec.files %>'
                }
            }
        },
        server: {
            port: 9002
        },
        connect: {
            sstudio: {
                options: {
                    port: 9001,
                    hostname: "*",
                    keepalive: true
                }
            },
            test : {
                port : 9002
            }
        },
        selenium: {
            options: {
                startURL: 'http://localhost:9001/',
                browsers: ['firefox']
            },
            suite: {
                files: {
                    'StackStudio': ['test/*.suite']
                }
            }
        },
        jasmine: {
            test: {
                options: {
                    specs: '<%= spec.files %>',
                    template: require('grunt-template-jasmine-requirejs'),
                    templateOptions: {
                        requireConfigFile: 'js/config/rjsConfig.js',
                        requireConfig: {
                            /* 
                                The application requires the absense of protocol when loading
                                remote resources so it can work with http and https.

                                Phantom however, does not do well with missing protocol when
                                executing unit tests. This inline config block is used to override,
                                via merge down, the default config set in rjsConfig.js above.
                            */
                            shim: {
                                'jasmine'       : {exports: 'jasmine'},
                                //'jasmine-html'  : {deps: ['jasmine'], exports: 'jasmine'},
                                'jasmine-jquery': {exports: 'jasmine'},
                                'jquery.multiselect': {deps: ['jquery']}
                            },
                            paths: {
                                'backbone'          : 'http://cdnjs.cloudflare.com/ajax/libs/backbone.js/1.0.0/backbone-min',
                                'jquery'            : 'http://ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min',
                                'jquery-ui'         : 'http://ajax.googleapis.com/ajax/libs/jqueryui/1.10.4/jquery-ui.min',
                                'jquery.form'       : 'http://cdnjs.cloudflare.com/ajax/libs/jquery.form/3.45/jquery.form',
                                'jquery.multiselect': 'http://cdn.jsdelivr.net/jquery.multiselect/1.13/jquery.multiselect.min',
                                'jquery.jstree'     : 'http://cdn.jsdelivr.net/jquery.jstree/pre1.0/jquery.jstree',
                                'jquery-migrate'    : 'http://code.jquery.com/jquery-migrate-1.1.0',
                                //'jasmine'           : 'node_modules/grunt-contrib-jasmine/vendor/jasmine-1.3.0/jasmine',
                                //'jasmine-html'      : 'node_modules/grunt-contrib-jasmine/vendor/jasmine-1.3.0/jasmine-html',
                                'jasmine-jquery'    : 'js/vendor/jasmine-jquery-1.3.0',
                                'underscore' : 'http://cdnjs.cloudflare.com/ajax/libs/lodash.js/1.1.0/lodash.min',
                                'bootstrap'  : 'https://netdna.bootstrapcdn.com/bootstrap/3.0.3/js/bootstrap.min',
                                'ace'        : 'http://cdnjs.cloudflare.com/ajax/libs/ace/1.1.01/ace',
                                'mode-json'  : 'http://cdnjs.cloudflare.com/ajax/libs/ace/1.1.01/mode-json',
                                'jquery.multiselect.filter': 'http://cdn.jsdelivr.net/jquery.multiselect/1.13/jquery.multiselect.filter.min'
                            },
                            map: {
                                '*': {
                                    /* Map any path used by a vendor or plugin here as neccessary */
                                    '//code.jquery.com/jquery-migrate-1.1.0.js': 'jquery-migrate'
                                }
                            }
                        }
                    }
                }
            }
        },
        less: {
            "2.0.0-rc1": {
                options: {
                    paths: ["css"],
                    compress: true
                },
                files: {
                    "css/main.css": "css/main.less",
                    "css/jquery.dataTables.css": "css/jquery.dataTables.less",
                    "css/jquery.terminal.css": "css/jquery.terminal.less",
                    "css/jquery.multiselect.css": "css/jquery.multiselect.less",
                    "css/jquery.multiselect.filter.css": "css/jquery.multiselect.filter.less",
                    "css/jquery-ui.css": "css/jquery-ui.less",
                    "css/morris.css": "css/morris.less"
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-selenium');
    grunt.loadNpmTasks('grunt-curl');
    grunt.loadNpmTasks('grunt-contrib-clean');

    // Default task.
    grunt.registerTask('test', ['jshint', 'less', 'curl', 'jasmine']);
    grunt.registerTask('default', ['jshint', 'less', 'curl', 'jasmine']);
    grunt.registerTask('run', ['jshint', 'less', 'curl', 'connect:sstudio', 'watch']);
    grunt.registerTask('build', ['jshint', 'curl', 'jasmine', 'concat', 'uglify']);
    grunt.registerTask('uncurl', ['clean']);

};
