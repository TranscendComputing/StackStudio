({
    //appDir is incompatible with single file compilation
    //appDir: "../",
    baseUrl: "vendor",
    //dir is incompatible with "out"
    //dir: "../../StackStudio-build",
    out: "stackplace-all.min.js",
    name: "../main",
    include: ["views/consoleAppView",
              "routers/router"],
    //modules: [
    //    {
    //        name: "main",
    //    },
    //    {
    //        name: "collections"
    //    }
    //],
    mainConfigFile: 'common.js',

    paths: {
        // r.js can't find this file.
        //main: '../main',
        common: '../common',
    }
})