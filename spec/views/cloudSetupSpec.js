/*jshint smarttabs:true */
/*global loadFixtures:false, setFixtures:false */
define(
    [
        'jquery',
        'common',
        'models/cloudAccount',
        'models/group',
        'models/user',
        'collections/cloudAccounts',
        'collections/groups',
        'collections/users',
        'views/cloud_setup/cloudSetupView',
        'jasmine-jquery'
    ],
    function($, Common, CloudAccountModel, GroupModel, UserModel,
             CloudAccountCollection, GroupCollection, UserCollection,
             CloudSetupView) {

        describe("Cloud Setup Function Callable Tests", function() {
            var cloudSetupView;

            beforeEach(function() {
                // Have to trap these here so object instantiation does
                // not propogate beyond initialize() method
                spyOn(CloudSetupView.prototype, 'onFetched');
                spyOn(CloudSetupView.prototype, 'render');
                cloudSetupView = new CloudSetupView();
            });

            it("render is callable", function() {
                 //spyOn(cloudSetupView, 'render');
                 cloudSetupView.render();
                 expect(cloudSetupView.render).toHaveBeenCalled();
            });

            it("onFetched is callable", function() {
                 //spyOn(cloudSetupView, 'onFetched');
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

                    switch(list) {
                        case '#cloud_account_list':
                            collection = new CloudAccountCollection([
                                new CloudAccountModel({id:"0000001", name:"Awesome Web Service 1"}),
                                new CloudAccountModel({id:"0000002", name:"Awesome Web Service 2"}),
                                new CloudAccountModel({id:"0000003", name:"Awesome Web Service 3"}),
                                new CloudAccountModel({id:"0000004", name:"Awesome Web Service 4"}),
                                new CloudAccountModel({id:"0000005", name:"Awesome Web Service 5"})
                            ]);
                            break;
                        case '#group_list':
                            collection = new GroupCollection([
                                new GroupModel({id:"0000001",name:"Development",description:"default development group"}),
                                new GroupModel({id:"0000002",name:"Test",description:"default test group"}),
                                new GroupModel({id:"0000003",name:"Stage",description:"default stage group"}),
                                new GroupModel({id:"0000004",name:"Production",description:"default production group"})
                            ]);
                            break;
                        case '#user_list':
                            collection = new UserCollection([
                                new UserModel({id:"0000001",login:"user1",email:"user1@momentumsi.com",first_name:"User",last_name:"One"}),
                                new UserModel({id:"0000002",login:"user2",email:"user2@momentumsi.com",first_name:"User",last_name:"Two"}),
                                new UserModel({id:"0000003",login:"user3",email:"user3@momentumsi.com",first_name:"User",last_name:"Three"}),
                                new UserModel({id:"0000004",login:"user4",email:"user4@momentumsi.com",first_name:"User",last_name:"Four"}),
                                new UserModel({id:"0000005",login:"user5",email:"user5@momentumsi.com",first_name:"User",last_name:"Five"})
                            ]);
                            break;
                        case '#cred_list':
                            break;
                        case '#policy_list':
                            break;
                        case '#source_control_list':
                            break;
                    }

                    if (collection) {
                        this.addAll(collection, $(list));
                    }
                });

                cloudSetupView = new CloudSetupView();
            });

            it("Verify view containing element is correct", function() {
                expect(cloudSetupView.$el).toBe('section#main');
            });

            it("Verify cloud account list is populated", function() {
                expect($('#cloud_account_list > li').length).toEqual(5);
            });

            it("Verify group list is populated", function() {
                expect($('#group_list > li').length).toEqual(4);
            });

            it("Verify user list is populated", function() {
                expect($('#user_list > li').length).toEqual(5);
            });

            xit("Verify credential list is populated", function() {
                expect($('#cred_list > li').length).toEqual(5);
            });

            xit("Verify policy list is populated", function() {
                expect($('#policy_list > li').length).toEqual(5);
            });

            xit("Verify source control list is populated", function() {
                expect($('#source_control_list > li').length).toEqual(5);
            });



            // XXX - Plan of action is to spyOn the internal cloudSetupView instance bindings
            // and trigger them and then check markup for each section population. These will still
            // fail without proper data sets. Thought: stub out the spy and provide dataset! :-)
            //
            // Then spyOn each initialize() method in each subApp view class and trigger different
            // views with different arguments and check that the proper view initialize() is called

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
        });
    }
);
