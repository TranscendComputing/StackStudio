({
    //appDir is incompatible with single file compilation
    //appDir: "../",
    baseUrl: "vendor",
    //dir is incompatible with "out"
    //dir: "../../StackStudio-build",
    out: "stackplace-all.min.js",
    name: "../main",
    include: [
              'jquery',
              'underscore',
              'backbone',
              'views/consoleAppView',
              'routers/router',
              'jquery-ui',
              // Copied from main.js innards; nested requires aren't loaded.
              'views/accountLoginView',
              'views/projectSidebarView',
              'views/projectAppView',
              'views/projectResourceSidebarView',
              'views/projectEditView',
              'views/resourceNavigationView',
              ],
    excludeShallow: ['jquery.jstree'], // doesn't play well minified.
    mainConfigFile: 'common.js',

    //logLevel: 0,

    paths: {
        // r.js can't find this file.
        common: '../common',
    }
})