({
    appDir: "../",
    baseUrl: "js",
    dir: "../../StackStudio-build",
    modules: [
        {
            name: "main",
        },
        {
            name: "collections"
        }   
    ],
    paths: {
        collections: '../collections',
        models: '../models',
        routers: '../routers',
        views: '../views',
        interpreters: '../interpreters',
        templates: '../../templates',
        'jquery': '//ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min',
        'jquery-ui': '//ajax.googleapis.com/ajax/libs/jqueryui/1.9.2/jquery-ui.min',
        'underscore': 'lodash',
        'backbone': 'backbone-0.9.9',
        'icanhaz': 'ICanHaz',
        'jquery.terminal': 'jquery.terminal-0.4.22',
        'jquery.mousewheel': 'jquery.mousewheel-min',
        'wijlist': 'jquery.wijmo.wijlist',
        'wijutil': 'jquery.wijmo.wijutil',
        'wijsuperpanel': 'jquery.wijmo.wijsuperpanel',
        'wijsplitter': 'jquery.wijmo.wijsplitter',
        'wijmo': 'jquery.wijmo-open.all.2.3.2.min'
    }
})