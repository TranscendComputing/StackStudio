/* jshint smarttabs:true */
/* global router:true */
define(['routers/router', 'common'], function(Router, Common) {
    describe("Verify Routes", function() {
        beforeEach(function() {
            /*
            This approach is definately not the most performant but is cleaner code 
            We don't need to create a spy for every route each time but this is better
            than binding spy, instantiating router and starting history in every test
            */
            Backbone.history.stop();
            spyOn(Router.prototype, "defaultRoute");
            spyOn(Router.prototype, "imagesRoute");
//            spyOn(Router.prototype, "cloudCredentials");
            spyOn(Router.prototype, "cloudSetupRoute");
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

        it("verify defaultRoute", function() {
            router.navigate('', true);
            expect(router.defaultRoute).toHaveBeenCalled();  
            expect(router.defaultRoute.mostRecentCall.args[0]).toBe('');
        });

        it("verify /images (imagesRoute)", function() {
            router.navigate('images', true);
            expect(router.imagesRoute).toHaveBeenCalled();
            expect(router.imagesRoute.mostRecentCall.args[0]).toBe(undefined);
        });

        it("verify /images/:id (imagesRoute)", function() {
            router.navigate('images/1', true);
            expect(router.imagesRoute).toHaveBeenCalled();
            expect(router.imagesRoute.mostRecentCall.args[0]).toBe('1');
        });

//        it("verify /account/cloudcredentials (cloudCredentials)", function() {
//            router.navigate('account/cloudcredentials', true);
//            expect(router.cloudCredentials).toHaveBeenCalled();
//        });

        /* begin /cloud/setup stuff */
        it("verify /cloud/setup (cloudSetupRoute)", function() {
            router.navigate('cloud/setup', {trigger: true});
            expect(router.cloudSetupRoute).toHaveBeenCalled();
            expect(router.cloudSetupRoute.mostRecentCall.args[0]).toBe(undefined);
        });

        it("verify /cloud/setup/cloud-accounts (cloudSetupRoute)", function() {
            router.navigate('cloud/setup/cloud-accounts', true);
            expect(router.cloudSetupRoute).toHaveBeenCalled();
            expect(router.cloudSetupRoute.mostRecentCall.args[0]).toBe('cloud-accounts');
        }); 

        it("verify /cloud/setup/cloud-credentials (cloudSetupRoute)", function() {
            router.navigate('cloud/setup/cloud-credentials', true);
            expect(router.cloudSetupRoute).toHaveBeenCalled();
            expect(router.cloudSetupRoute.mostRecentCall.args[0]).toBe('cloud-credentials');
        }); 

        it("verify /cloud/setup/users (cloudSetupRoute)", function() {
            router.navigate('cloud/setup/users', true);
            expect(router.cloudSetupRoute).toHaveBeenCalled();
            expect(router.cloudSetupRoute.mostRecentCall.args[0]).toBe('users');
        }); 

        it("verify /cloud/setup/policies (cloudSetupRoute)", function() {
            router.navigate('cloud/setup/policies', true);
            expect(router.cloudSetupRoute).toHaveBeenCalled();
            expect(router.cloudSetupRoute.mostRecentCall.args[0]).toBe('policies');
        }); 

        it("verify /cloud/setup/policy (cloudSetupRoute)", function() {
            router.navigate('cloud/setup/policy', true);
            expect(router.cloudSetupRoute).toHaveBeenCalled();
            expect(router.cloudSetupRoute.mostRecentCall.args[0]).toBe('policy');
        }); 

        it("verify /cloud/setup/groups (cloudSetupRoute)", function() {
            router.navigate('cloud/setup/groups', true);
            expect(router.cloudSetupRoute).toHaveBeenCalled();
            expect(router.cloudSetupRoute.mostRecentCall.args[0]).toBe('groups');
        }); 

        it("verify /cloud/setup/groups_list (cloudSetupRoute)", function() {
            router.navigate('cloud/setup/groups_list', true);
            expect(router.cloudSetupRoute).toHaveBeenCalled();
            expect(router.cloudSetupRoute.mostRecentCall.args[0]).toBe('groups_list');
        }); 

        it("verify /cloud/setup/cloud-credentials_list (cloudSetupRoute)", function() {
            router.navigate('cloud/setup/cloud-credentials_list', true);
            expect(router.cloudSetupRoute).toHaveBeenCalled();
            expect(router.cloudSetupRoute.mostRecentCall.args[0]).toBe('cloud-credentials_list');
        }); 

        it("verify /cloud/setup/cloud-accounts_list (cloudSetupRoute)", function() {
            router.navigate('cloud/setup/cloud-accounts_list', true);
            expect(router.cloudSetupRoute).toHaveBeenCalled();
            expect(router.cloudSetupRoute.mostRecentCall.args[0]).toBe('cloud-accounts_list');
        }); 

        it("verify /cloud/setup/configuration_managers (cloudSetupRoute)", function() {
            router.navigate('cloud/setup/configuration_managers', true);
            expect(router.cloudSetupRoute).toHaveBeenCalled();
            expect(router.cloudSetupRoute.mostRecentCall.args[0]).toBe('configuration_managers');
        }); 

        it("verify /cloud/setup/continuous_integration (cloudSetupRoute)", function() {
            router.navigate('cloud/setup/continuous_integration', true);
            expect(router.cloudSetupRoute).toHaveBeenCalled();
            expect(router.cloudSetupRoute.mostRecentCall.args[0]).toBe('continuous_integration');
        }); 

        it("verify /cloud/setup/source_control_repositories (cloudSetupRoute)", function() {
            router.navigate('cloud/setup/source_control_repositories', true);
            expect(router.cloudSetupRoute).toHaveBeenCalled();
            expect(router.cloudSetupRoute.mostRecentCall.args[0]).toBe('source_control_repositories');
        }); 

        it("verify /cloud/setup/home (cloudSetupRoute)", function() {
            router.navigate('cloud/setup/home', true);
            expect(router.cloudSetupRoute).toHaveBeenCalled();
            expect(router.cloudSetupRoute.mostRecentCall.args[0]).toBe('home');
        }); 

        /* end /cloud/setup stuff */
        it("verify /resources (resourcesRoute)", function() {
            router.navigate('resources', true);
            expect(router.resourcesRoute).toHaveBeenCalled();
            expect(router.resourcesRoute.mostRecentCall.args[0]).toBe(undefined);
        });

        it("verify /resources/:cloud (resourcesRoute)", function() {
            router.navigate('resources/cloud', true);
            expect(router.resourcesRoute).toHaveBeenCalled();
            expect(router.resourcesRoute.mostRecentCall.args.slice(0,1)).toEqual(['cloud']);
        });

        it("verify /resources/:cloud/:region (resourcesRoute)", function() {
            router.navigate('resources/cloud/region', true);
            expect(router.resourcesRoute).toHaveBeenCalled();
            expect(router.resourcesRoute.mostRecentCall.args.slice(0,2))
                .toEqual(['cloud', 'region']);
        });

        it("verify /resources/:cloud/:region/:type (resourcesRoute)", function() {
            router.navigate('resources/cloud/region/type', true);
            expect(router.resourcesRoute).toHaveBeenCalled();
            expect(router.resourcesRoute.mostRecentCall.args.slice(0,3))
                .toEqual(['cloud', 'region', 'type']);
        });

        it("verify /resources/:cloud/:region/:type/:subtype (resourcesRoute)", function() {
            router.navigate('resources/cloud/region/type/subtype', true);
            expect(router.resourcesRoute).toHaveBeenCalled();
            expect(router.resourcesRoute.mostRecentCall.args.slice(0,4))
                .toEqual(['cloud', 'region', 'type', 'subtype']);
        });

        it("verify /resources/:cloud/:region/:type/:subtype/:id (resourcesRoute)", function() {
            router.navigate('resources/cloud/region/type/subtype/1', true);
            expect(router.resourcesRoute).toHaveBeenCalled();
            expect(router.resourcesRoute.mostRecentCall.args.slice(0,5))
                .toEqual(['cloud', 'region', 'type', 'subtype', '1']);
        });

        it("verify /assemblies (assembliesRoute)", function() {
            router.navigate('assemblies', true);
            expect(router.assembliesRoute).toHaveBeenCalled();
            expect(router.assembliesRoute.mostRecentCall.args[0]).toBe(undefined);
        });

        it("verify /platform_components (platformComponentsRoute)", function() {
            router.navigate('platform_components', true);
            expect(router.platformComponentsRoute).toHaveBeenCalled();
            expect(router.platformComponentsRoute.mostRecentCall.args[0]).toBe(undefined);
        });

        it("verify /stacks (stacksRoute)", function() {
            router.navigate('stacks', true);
            expect(router.stacksRoute).toHaveBeenCalled();
            expect(router.stacksRoute.mostRecentCall.args[0]).toBe(undefined);
        });

        it("verify /offerings (offeringsRoute)", function() {
            router.navigate('offerings', true);
            expect(router.offeringsRoute).toHaveBeenCalled();
            expect(router.offeringsRoute.mostRecentCall.args[0]).toBe(undefined);
        });

/*
        it("verify /projects (projects)", function() {
            router.navigate('projects', true);
            expect(router.projects).toHaveBeenCalled();
        });

        it("verify /projects/new (projectCreate)", function() {
            router.navigate('projects/new', true);
            expect(router.projectCreate).toHaveBeenCalled();
        });

        it("verify /projects/:url (projectEdit)", function() {
            router.navigate('projects/url', true);
            expect(router.projectEdit).toHaveBeenCalled();
        });

        it("verify /projects/:id/update/:resource (projectUpdate)", function() {
            router.navigate('projects/1/update/resource', true);
            expect(router.projectUpdate).toHaveBeenCalled();
        });
*/
    });
});
