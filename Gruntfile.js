/*jshint smarttabs:true */
/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    meta: {
      version: '2.0.0-rc1',
      banner: '/*! StackStudio - v<%= meta.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '* https://github.com/TranscendComputing/StackStudio\n' +
        '* Copyright (c) <%= grunt.template.today("yyyy") %> ' +
        'Transcend Computing; Licensed APL2 */'
    },
    source: {
        files: ['public/js/interpreters/**/*.js',
                'public/js/models/**/*.js', 'public/js/views/**/*.js', 'public/js/collections/**/*.js']
    },
    spec: {
        files: ['public/spec/**/*.js']
    },
    lint: {
      files: ['Gruntfile.js',
              '<%= spec.files %>',
              '<%= source.files %>']
    },
    concat: {
        options: {
            stripBanners: true,
            banner: '<%= meta.banner %>'
        },
        dist: {
            src: ['public/js/main.js', 'public/js/plugins.js'],
            dest: 'dist/StackStudio.js'
        }
    },
    uglify: {
        options: {
            stripBanners: true,
            banner: '<%= meta.banner %>'
        },
        misc: {
            files: {
                'dist/StackStudio.min.js': ['<%= source.files %>', '<%= concat.dist.dest %>']
            }
        }
    },
    watch: {
      files: '<%= lint.files %>',
      tasks: 'default'
    },
    jshint: {
      all: '<%= lint.files %>',
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
        globals: {
            jQuery: true
        }
      }
    },
    server: {
      port: 9001
    },
    connect: {
        sstudio: {
            options: {
                port: 9000,
                base: 'public'
            }
        },
        test : {
            port : 9001
        }
    },
    jasmine: {
        requirejs: {
            options: {
                specs: '<%= spec.files %>',
                template: 'requirejs',
                templateOptions: {
                    requireConfig: {
                        baseUrl: '',
                        // The shim config allows us to configure dependencies for
                        // scripts that do not call define() to register a module
                        shim: {
                            'jquery-ui': {
                                deps: ['jquery']
                            },
                            'underscore': {
                                exports: '_'
                            },
                            'backbone': {
                                deps: [
                                       'underscore',
                                       'jquery'
                                       ],
                                       exports: 'Backbone'
                            },
                            'icanhaz': {
                                deps: ['jquery'],
                                exports: 'ich'
                            },
                            'jquery.terminal': {
                                deps: ['jquery', 'jquery.mousewheel'],
                                exports: 'jQuery.fn.terminal'
                            },
                            'jquery.dataTables': {
                                deps: ['jquery'],
                                exports: 'jQuery.fn.dataTable'
                            },
                            'jquery.purr': {
                                deps: ['jquery'],
                                exports: 'jQuery.fn.purr'
                            },
                            'jquery.mousewheel': {
                                deps: ['jquery'],
                                exports: 'jQuery.fn.mousewheel'
                            }
                        },
                        paths: {
                            collections: 'public/js/collections',
                            models: 'public/js/models',
                            routers: 'public/js/routers',
                            views: 'public/js/views',
                            interpreters: 'public/js/interpreters',
                            'jquery': 'public/js/vendor/jquery-1.8.3.min',
                            'jquery-ui': 'public/js/vendor/jquery-ui-1.8.17.custom.min',
                            'underscore': 'public/js/vendor/lodash',
                            'backbone': 'public/js/vendor/backbone-0.9.9',
                            'icanhaz': 'public/js/vendor/ICanHaz',
                            'jquery.terminal': 'public/js/vendor/jquery.terminal-0.4.22',
                            'jquery.mousewheel': 'public/js/vendor/jquery.mousewheel-min'
                        }
                    }
                }
            }
        }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-connect');

  // Default task.
  grunt.registerTask('default', ['jshint', 'jasmine']);
  grunt.registerTask('run', ['connect:sstudio', 'watch']);
  grunt.registerTask('build', ['jasmine', 'concat', 'uglify']);

};
