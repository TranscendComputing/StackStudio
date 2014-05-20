({
    appDir: "../",
    baseUrl: "js",
    dir: "../../StackStudio-build",
    modules: [
        {
            name: "main"
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
        'jquery': '//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min',
        'jquery-ui': '//ajax.googleapis.com/ajax/libs/jqueryui/1.9.2/jquery-ui.min',
        'underscore': 'lodash',
        'backbone': 'backbone-1.0.0',
        'icanhaz': 'ICanHaz',
        'jquery.terminal': 'jquery.terminal-0.7.3',
        'jquery.mousewheel': 'jquery.mousewheel-min'
    }
});
