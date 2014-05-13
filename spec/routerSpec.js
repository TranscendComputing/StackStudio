/*jshint smarttabs:true */
/*global define:true console:true describe:true it:true expect:true */
define(['routers/router'], function(Router) {
    describe("Verify Routes", function() {
        beforeEach(function() {
            spyOn(Router.prototype, "defaultRoute")
            spyOn(Router.prototype, "imagesRoute")
//            spyOn(Router.prototype, "cloudCredentials")
            spyOn(Router.prototype, "accountManagementRoute")
            spyOn(Router.prototype, "resourcesRoute")
            spyOn(Router.prototype, "assembliesRoute")
            spyOn(Router.prototype, "platformComponentsRoute")
            spyOn(Router.prototype, "stacksRoute")
            spyOn(Router.prototype, "offeringsRoute")
//            spyOn(Router.prototype, "projects")
//            spyOn(Router.prototype, "projectCreate")
//            spyOn(Router.prototype, "projectEdit")
//            spyOn(Router.prototype, "projectUpdate")

            router = new Router();
            Backbone.history.start();
        });

        afterEach(function() {
            Backbone.history.stop();
        });

        it("verify defaultRoute", function() {
            router.navigate('/', true);
            expect(Router.prototype.defaultRoute).toHaveBeenCalled();  
        });

        it("verify imagesRoute", function() {
            router.navigate('images', true);
            expect(Router.prototype.imagesRoute).toHaveBeenCalled();
        });

        it("verify imagesRoute", function() {
            router.navigate('images/1', true);
            expect(Router.prototype.imagesRoute).toHaveBeenCalled();
        });

//        it("verify cloudCredentials", function() {
//            router.navigate('account/cloudcredentials', true);
//            expect(Router.prototype.cloudCredentials).toHaveBeenCalled();
//        });

        it("verify accountManagementRoute", function() {
            router.navigate('account/management', true);
            expect(Router.prototype.accountManagementRoute).toHaveBeenCalled();
        });

        it("verify resourcesRoute", function() {
            router.navigate('resources', true);
            expect(Router.prototype.resourcesRoute).toHaveBeenCalled();
        });

        it("verify resourcesRoute", function() {
            router.navigate('resources/cloud', true);
            expect(Router.prototype.resourcesRoute).toHaveBeenCalled();
        });

        it("verify resourcesRoute", function() {
            router.navigate('resources/cloud/region', true);
            expect(Router.prototype.resourcesRoute).toHaveBeenCalled();
        });

        it("verify resourcesRoute", function() {
            router.navigate('resources/cloud/region/type', true);
            expect(Router.prototype.resourcesRoute).toHaveBeenCalled();
        });

        it("verify resourcesRoute", function() {
            router.navigate('resources/cloud/region/type/subtype', true);
            expect(Router.prototype.resourcesRoute).toHaveBeenCalled();
        });

        it("verify resourcesRoute", function() {
            router.navigate('resources/cloud/region/type/subtype/1', true);
            expect(Router.prototype.resourcesRoute).toHaveBeenCalled();
        });

        it("verify assembliesRoute", function() {
            router.navigate('assemblies', true);
            expect(Router.prototype.assembliesRoute).toHaveBeenCalled();
        });

        it("verify platformComponentsRoute", function() {
            router.navigate('platform_components', true);
            expect(Router.prototype.platformComponentsRoute).toHaveBeenCalled();
        });

        it("verify stacksRoute", function() {
            router.navigate('stacks', true);
            expect(Router.prototype.stacksRoute).toHaveBeenCalled();
        });

        it("verify offeringsRoute", function() {
            router.navigate('offerings', true);
            expect(Router.prototype.offeringsRoute).toHaveBeenCalled();
        });

/*
        it("verify projects", function() {
            router.navigate('projects', true);
            expect(Router.prototype.projects).toHaveBeenCalled();
        });

        it("verify projectCreate", function() {
            router.navigate('projects/new', true);
            expect(Router.prototype.projectCreate).toHaveBeenCalled();
        });

        it("verify projectEdit", function() {
            router.navigate('projects/url', true);
            expect(Router.prototype.projectEdit).toHaveBeenCalled();
        });

        it("verify projectUpdate", function() {
            router.navigate('projects/1/update/resource', true);
            expect(Router.prototype.projectUpdate).toHaveBeenCalled();
        });
*/
    });
});
