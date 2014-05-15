/* jshint smarttabs:true */
/* global router:true */
define(['routers/router', 'common'], function(Router, Common) {
    describe("Verify Routes", function() {
        beforeEach(function() {
//            spyOn(Router.prototype, "defaultRoute");//.andCallThrough();
            spyOn(Router.prototype, "imagesRoute");
//            spyOn(Router.prototype, "cloudCredentials");
            spyOn(Router.prototype, "accountManagementRoute");
            spyOn(Router.prototype, "resourcesRoute");
            spyOn(Router.prototype, "assembliesRoute");
            spyOn(Router.prototype, "platformComponentsRoute");
            spyOn(Router.prototype, "stacksRoute");
            spyOn(Router.prototype, "offeringsRoute");
//            spyOn(Router.prototype, "projects");
//            spyOn(Router.prototype, "projectCreate");
//            spyOn(Router.prototype, "projectEdit");
//            spyOn(Router.prototype, "projectUpdate");

            router = new Router();
            Backbone.history.start();
        });

        afterEach(function() {
            Backbone.history.stop();
        });

        it("verify defaultRoute", function() {
            router.navigate('/', {trigger: true});
            //expect(Router.prototype.defaultRoute).toHaveBeenCalled();  
            //Common.vent.trigger("route:dashboard");
            //console.info($(document).text());
            //expect($("#getstarted").length > 0).toBeTruthy();
        });

        it("verify /images (imagesRoute)", function() {
            router.navigate('images', true);
            expect(Router.prototype.imagesRoute).toHaveBeenCalled();
        });

        it("verify /images/:id (imagesRoute)", function() {
            router.navigate('images/1', true);
            expect(Router.prototype.imagesRoute).toHaveBeenCalled();
        });

//        it("verify /account/cloudcredentials (cloudCredentials)", function() {
//            router.navigate('account/cloudcredentials', true);
//            expect(Router.prototype.cloudCredentials).toHaveBeenCalled();
//        });

        it("verify /account/management (accountManagementRoute)", function() {
            router.navigate('account/management', true);
            expect(Router.prototype.accountManagementRoute).toHaveBeenCalled();
        });

        it("verify /resources (resourcesRoute)", function() {
            router.navigate('resources', true);
            expect(Router.prototype.resourcesRoute).toHaveBeenCalled();
        });

        it("verify /resources/:cloud (resourcesRoute)", function() {
            router.navigate('resources/cloud', true);
            expect(Router.prototype.resourcesRoute).toHaveBeenCalled();
        });

        it("verify /resources/:cloud/:region (resourcesRoute)", function() {
            router.navigate('resources/cloud/region', true);
            expect(Router.prototype.resourcesRoute).toHaveBeenCalled();
        });

        it("verify /resources/:cloud/:region/:type (resourcesRoute)", function() {
            router.navigate('resources/cloud/region/type', true);
            expect(Router.prototype.resourcesRoute).toHaveBeenCalled();
        });

        it("verify /resources/:cloud/:region/:type/:subtype (resourcesRoute)", function() {
            router.navigate('resources/cloud/region/type/subtype', true);
            expect(Router.prototype.resourcesRoute).toHaveBeenCalled();
        });

        it("verify /resources/:cloud/:region/:type/:subtype/:id (resourcesRoute)", function() {
            router.navigate('resources/cloud/region/type/subtype/1', true);
            expect(Router.prototype.resourcesRoute).toHaveBeenCalled();
        });

        it("verify /assemblies (assembliesRoute)", function() {
            router.navigate('assemblies', true);
            expect(Router.prototype.assembliesRoute).toHaveBeenCalled();
        });

        it("verify /platform_components (platformComponentsRoute)", function() {
            router.navigate('platform_components', true);
            expect(Router.prototype.platformComponentsRoute).toHaveBeenCalled();
        });

        it("verify /stacks (stacksRoute)", function() {
            router.navigate('stacks', true);
            expect(Router.prototype.stacksRoute).toHaveBeenCalled();
        });

        it("verify /offerings (offeringsRoute)", function() {
            router.navigate('offerings', true);
            expect(Router.prototype.offeringsRoute).toHaveBeenCalled();
        });

/*
        it("verify /projects (projects)", function() {
            router.navigate('projects', true);
            expect(Router.prototype.projects).toHaveBeenCalled();
        });

        it("verify /projects/new (projectCreate)", function() {
            router.navigate('projects/new', true);
            expect(Router.prototype.projectCreate).toHaveBeenCalled();
        });

        it("verify /projects/:url (projectEdit)", function() {
            router.navigate('projects/url', true);
            expect(Router.prototype.projectEdit).toHaveBeenCalled();
        });

        it("verify /projects/:id/update/:resource (projectUpdate)", function() {
            router.navigate('projects/1/update/resource', true);
            expect(Router.prototype.projectUpdate).toHaveBeenCalled();
        });
*/
    });
});
