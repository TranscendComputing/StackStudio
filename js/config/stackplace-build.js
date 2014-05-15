({
    //appDir is incompatible with single file compilation
    //appDir: "../",
    baseUrl: "vendor",
    //dir is incompatible with "out"
    //dir: "../../StackStudio-build",
    out: "stackplace-all.min.js",
    name: "../main",
    include: [
              './common',
              // Copied from main.js innards; nested requires aren't loaded.
              'views/accountLoginView',
              'views/projectSidebarView',
              'views/projectAppView',
              'views/projectResourceSidebarView',
              'views/projectEditView',
              'views/resource/resourceNavigationView'
              ],
    excludeShallow: ['jquery.jstree'], // doesn't play well minified.
    mainConfigFile: 'common.js',

    optimize: "uglify2",
    generateSourceMaps: true,
    preserveLicenseComments: false, // required for source maps
    //logLevel: 0,

    paths: {
        // r.js can't find this file.
        common: '../common'
    }
});
