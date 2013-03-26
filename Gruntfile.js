/*jshint smarttabs:true */
/*global module:false require:true*/
module.exports = function(grunt) {

  // Project configuration.
    grunt.initConfig({
      pkg: grunt.file.readJSON('package.json'),
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
                'js/openstack/**/*.js']
    },
    spec: {
        files: ['spec/**/*.js']
    },
    lint: {
      files: ['Gruntfile.js',
              'js/stackplace.build.js',
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
          globals: {
            describe: true,
            it: true,
            expect: true
          }
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
                port: 9001
            }
        },
        test : {
            port : 9002
        }
    },
    selenium: {
        options: {
            startURL: 'http://localhost:9001',
            browsers: ['firefox']
        },
        suite: {
            files: {
                'example': ['test/*.suite']
            }
        }
    },
    jasmine: {
        test: {
            options: {
                specs: '<%= spec.files %>',
                template: require('grunt-template-jasmine-requirejs'),
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
                            collections: 'js/collections',
                            models: 'js/models',
                            routers: 'js/routers',
                            views: 'js/views',
                            interpreters: 'js/interpreters',
                            'jquery': 'js/vendor/jquery-1.8.3.min',
                            'jquery-ui': 'js/vendor/jquery-ui-1.8.17.custom.min',
                            'underscore': 'js/vendor/lodash',
                            'backbone': 'js/vendor/backbone-0.9.9',
                            'icanhaz': 'js/vendor/ICanHaz',
                            'jquery.terminal': 'js/vendor/jquery.terminal-0.4.22',
                            'jquery.mousewheel': 'js/vendor/jquery.mousewheel-min'
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
            "css/jquery.ui.selectmenu.css": "css/jquery.ui.selectmenu.less",
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

  // Default task.
  grunt.registerTask('default', ['jshint', 'jasmine']);
  grunt.registerTask('run', ['less', 'connect:sstudio', 'watch']);
  grunt.registerTask('build', ['jasmine', 'concat', 'uglify']);

};
