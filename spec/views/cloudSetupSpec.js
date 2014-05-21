/*jshint smarttabs:true */
/*global loadFixtures:false, setFixtures:false */
define(
    [
        'jquery',
        'common',
        'models/cloudAccount',
        'collections/cloudAccounts',
        'views/cloud_setup/cloudSetupView',
        'jasmine-jquery'
    ],
    function($, Common, CloudAccountModel, CloudAccountCollection, CloudSetupView) {
        describe("Cloud Setup Function Callable Tests", function() {
            spyOn(CloudSetupView.prototype, 'onFetched');
            spyOn(CloudSetupView.prototype, 'render');
            var cloudSetupView = new CloudSetupView();

            it("render is callable", function() {
                 spyOn(cloudSetupView, 'render');
                 cloudSetupView.render();
                 expect(cloudSetupView.render).toHaveBeenCalled();
            });

            it("onFetched is callable", function() {
                 spyOn(cloudSetupView, 'onFetched');
                 cloudSetupView.onFetched();
                 expect(cloudSetupView.onFetched).toHaveBeenCalled();
            });

            it("tabSelected is callable", function() {
                 spyOn(cloudSetupView, 'tabSelected');
                 cloudSetupView.tabSelected();
                 expect(cloudSetupView.tabSelected).toHaveBeenCalled();
            });

            it("addAll is callable", function() {
                 spyOn(cloudSetupView, 'addAll');
                 cloudSetupView.addAll();
                 expect(cloudSetupView.addAll).toHaveBeenCalled();
            });

            it("itemSelected is callable", function() {
                 spyOn(cloudSetupView, 'itemSelected');
                 cloudSetupView.itemSelected();
                 expect(cloudSetupView.itemSelected).toHaveBeenCalled();
            });

            it("close is callable", function() {
                 spyOn(cloudSetupView, 'close');
                 cloudSetupView.close();
                 expect(cloudSetupView.close).toHaveBeenCalled();
            });
        });

        describe("Cloud Setup Data Integrity Tests", function() {
            var cloudSetupView;

            beforeEach(function() {
                setFixtures('<section id="main"></section>');
                spyOn(CloudSetupView.prototype, 'render').andCallFake(function() {
                    this.$el.html(this.template);
                });
                spyOn(CloudSetupView.prototype, 'onFetched').andCallFake(function(list) {
                    var collection;
                    if (list == '#cloud_account_list') {
                        collection = new CloudAccountCollection([
                            new CloudAccountModel({id:"0000001", name:"Awesome Web Service 1"}),
                            new CloudAccountModel({id:"0000002", name:"Awesome Web Service 2"}),
                            new CloudAccountModel({id:"0000003", name:"Awesome Web Service 3"}),
                            new CloudAccountModel({id:"0000004", name:"Awesome Web Service 4"}),
                            new CloudAccountModel({id:"0000005", name:"Awesome Web Service 5"})
                        ]);
                    }

                    if (collection) {
                        this.addAll(collection, $(list));
                    }
                });
                cloudSetupView = new CloudSetupView();
            });

            it("Verify view is as intended with no datasets", function() {
//                spyOn(CloudSetupView.prototype, 'onFetched');
//                cloudSetupView = new CloudSetupView();

                expect(cloudSetupView.$el).toBe('section#main');
                //expect($('#cloud_account_list')).toBeEmpty();
                expect($('#cred_list')).toBeEmpty();
                expect($('#group_list')).toBeEmpty();
                expect($('#policy_list')).toBeEmpty();
                expect($('#user_list')).toBeEmpty();
                expect($('#source_control_list')).toBeEmpty();
            });

            // XXX - Plan of action is to spyOn the internal cloudSetupView instance bindings
            // and trigger them and then check markup for each section population. These will still
            // fail without proper data sets. Thought: stub out the spy and provide dataset! :-)
            //
            // Then spyOn each initialize() method in each subApp view class and trigger different
            // views with different arguments and check that the proper view initialize() is called

            it("Verify view is as intended with cloud accounts dataset", function() {
                //cloudSetupView = new CloudSetupView();
                expect($('#cloud_account_list > li').length).toEqual(5);
            });

            xit("trigger jQuery binding route:cloudSetup", function() {
                Common.router.trigger("route:cloudSetup");
                console.info('cloudSetup: '+$('#main').html());
            });

            xit("trigger jQuery binding route:cloudSetup sending cloud-accounts", function() {
                Common.router.trigger("route:cloudSetup", 'cloud-accounts');
                console.info('cloudSetup:cloud-accounts: '+$('#main').html());
                //expect($('#cloud_account_list')).not.toBeEmpty();
                //expect(Common.TargetView instanceof CloudCloudSetupView).toBeTruthy();
            });






            xit("trigger jQuery binding route:accountManagement sending cloud-credentials", function() {
                Common.router.trigger("route:accountManagement", 'cloud-credentials');
            });

            xit("trigger jQuery binding route:accountManagement sending users", function() {
                Common.router.trigger("route:accountManagement", 'users');
            });

            xit("trigger jQuery binding route:accountManagement sending policies", function() {
                Common.router.trigger("route:accountManagement", 'policies');
            });

            xit("trigger jQuery binding route:accountManagement sending policy", function() {
                Common.router.trigger("route:accountManagement", 'policy');
            });

            xit("trigger jQuery binding route:accountManagement sending groups", function() {
                Common.router.trigger("route:accountManagement", 'groups');
            });

            xit("trigger jQuery binding route:accountManagement sending groups_list", function() {
                Common.router.trigger("route:accountManagement", 'groups_list');
            });

            xit("trigger jQuery binding route:accountManagement sending cloud-credentials_list", function() {
                Common.router.trigger("route:accountManagement", 'cloud-credentials_list');
            });

            xit("trigger jQuery binding route:accountManagement sending cloud-accounts_list", function() {
                Common.router.trigger("route:accountManagement", 'cloud-accounts_list');
            });

            xit("trigger jQuery binding route:accountManagement sending configuration_managers", function() {
                Common.router.trigger("route:accountManagement", 'configuration_managers');
            });

            xit("trigger jQuery binding route:accountManagement sending continuous_integration", function() {
                Common.router.trigger("route:accountManagement", 'continuous_integration');
            });

            xit("trigger jQuery binding route:accountManagement sending source_control_repositories", function() {
                Common.router.trigger("route:accountManagement", 'source_control_repositories');
            });

            // Disabled for now becasue this binding calls homeView constructor,
            // then that constructor calls render and render calls displayPasswordRules
            // which attempts to parse JSON from sessionStorage which is not present in tests
            xit("trigger jQuery binding route:accountManagement sending home", function() {
                Common.router.trigger("route:accountManagement", 'home');
            });
        });
    }
);
