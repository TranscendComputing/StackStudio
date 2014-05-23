/*jshint smarttabs:true */
/*global loadFixtures:false, setFixtures:false */
define(
    [
        'jquery',
        'common',
        'models/cloudCredential',
        'models/cloudAccount',
        'models/group',
        'models/user',
        'models/policy',
        'models/sourceControlRepository',
        'models/configManager',
        'collections/cloudCredentials',
        'collections/cloudAccounts',
        'collections/groups',
        'collections/users',
        'collections/policies',
        'collections/sourceControlRepositories',
        'collections/configManagers',
        'views/account/cloudCredentialManagementListView',
        'views/account/sourceControlRepositoryManagementListView',
        'views/account/devOpsToolsManagementView',
        'views/cloud_setup/cloudSetupView',
        'jasmine-jquery'
    ],
    function($, Common, CredModel, AccountModel, GroupModel, UserModel,
             PolicyModel, SCRModel, ConfigModel, CredCollection, AccountCollection,
             GroupCollection, UserCollection, PolicyCollection, SCRCollection,
             ConfigCollection, CredManagementListView, SCRManagementListView,
             DevOpsToolsManagementView, CloudSetupView) {

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
                            collection = new AccountCollection([
                                new AccountModel({id:"0000001", name:"Awesome Web Service 1"}),
                                new AccountModel({id:"0000002", name:"Awesome Web Service 2"}),
                                new AccountModel({id:"0000003", name:"Awesome Web Service 3"}),
                                new AccountModel({id:"0000004", name:"Awesome Web Service 4"}),
                                new AccountModel({id:"0000005", name:"Awesome Web Service 5"})
                            ]);
                            break;
                        case '#group_list':
                            collection = new GroupCollection([
                                new GroupModel({
                                    id:"0000001",name:"Development",
                                    description:"default development group"
                                }),
                                new GroupModel({
                                    id:"0000002",name:"Test",
                                    description:"default test group"
                                }),
                                new GroupModel({
                                    id:"0000003",name:"Stage",
                                    description:"default stage group"
                                }),
                                new GroupModel({
                                    id:"0000004",name:"Production",
                                    description:"default production group"
                                })
                            ]);
                            break;
                        case '#user_list':
                            collection = new UserCollection([
                                new UserModel({
                                    id:"0000001",login:"user1",email:"user1@momentumsi.com",
                                    first_name:"User",last_name:"One"
                                }),
                                new UserModel({
                                    id:"0000002",login:"user2",email:"user2@momentumsi.com",
                                    first_name:"User",last_name:"Two"
                                }),
                                new UserModel({
                                    id:"0000003",login:"user3",email:"user3@momentumsi.com",
                                    first_name:"User",last_name:"Three"
                                }),
                                new UserModel({
                                    id:"0000004",login:"user4",email:"user4@momentumsi.com",
                                    first_name:"User",last_name:"Four"
                                }),
                                new UserModel({
                                    id:"0000005",login:"user5",email:"user5@momentumsi.com",
                                    first_name:"User",last_name:"Five"
                                })
                            ]);
                            break;
                        case '#policy_list':
                            collection = new PolicyCollection([
                                new PolicyModel({id:"0000001", name:"Awesome Policy 1"}),
                                new PolicyModel({id:"0000002", name:"Awesome Policy 2"}),
                                new PolicyModel({id:"0000003", name:"Awesome Policy 3"}),
                                new PolicyModel({id:"0000004", name:"Awesome Policy 4"}),
                                new PolicyModel({id:"0000005", name:"Awesome Policy 5"})
                            ]);
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

            it("Verify policy list is populated", function() {
                expect($('#policy_list > li').length).toEqual(5);
            });

            it("Verify credential list is populated", function() {
                //console.info($("#main").html());
                var collection = new CredCollection([
                    new CredModel({
                        id:"0000001",name:"Creds 1",description:"Creds 1",cloud_id:"0000001",
                        cloud_name:"Cloud 1",cloud_provider:"Provider 1",access_key:"0000001",
                        secret_key:"1000000"}),
                    new CredModel({
                        id:"0000002",name:"Creds 2",description:"Creds 2",cloud_id:"0000002",
                        cloud_name:"Cloud 2",cloud_provider:"Provider 2",access_key:"0000002",
                        secret_key:"2000000"}),
                    new CredModel({
                        id:"0000003",name:"Creds 3",description:"Creds 3",cloud_id:"0000003",
                        cloud_name:"Cloud 3",cloud_provider:"Provider 3",access_key:"0000003",
                        secret_key:"3000000"}),
                    new CredModel({
                        id:"0000004",name:"Creds 4",description:"Creds 4",cloud_id:"0000004",
                        cloud_name:"Cloud 4",cloud_provider:"Provider 4",access_key:"0000004",
                        secret_key:"4000000"})
                ]);

                cloudSetupView.addAll(collection, $('#cred_list'));
                expect($('#cred_list > li').length).toEqual(4);
            });

            it("Verify source control list is populated", function() {
                var collection = new SCRCollection([
                    new SCRModel({
                        _id:"0000001",org_name:"Org 1",name:"Git Repo 1",type:"git",
                        url:"http://www.google.com",username:"username",
                        password:"password",key:"key"}),
                    new SCRModel({
                        _id:"0000002",org_name:"Org 2",name:"Git Repo 2",type:"git",
                        url:"http://www.google.com",username:"username",
                        password:"password",key:"key"}),
                    new SCRModel({
                        _id:"0000003",org_name:"Org 3",name:"Other Repo 1",type:"other",
                        url:"http://www.google.com",username:"username",
                        password:"password",key:"key"}),
                    new SCRModel({
                        _id:"0000004",org_name:"Org 4",name:"Other Repo 2",type:"other",
                        url:"http://www.google.com",username:"username",
                        password:"password",key:"key"})
                ]);

                var scrManagementListView = new SCRManagementListView({rootView:cloudSetupView});
                scrManagementListView.repositories = collection;
                scrManagementListView.renderRepositories();

                expect($('.manager_list:eq(0) p', '#repositories_page').length).toEqual(2);
                expect($('.manager_list:eq(1) p', '#repositories_page').length).toEqual(2);
            });

            it("Verify configuration managers list is populated", function() {
                var collection = new ConfigCollection([
                    new ConfigModel({
                        _id:"0000001",org_id:"1000000",name:"Chef Manager 1",type:"chef",
                        url:"http://www.google.com",branch:"Branch_1"}),
                    new ConfigModel({
                        _id:"0000002",org_id:"2000000",name:"Chef Manager 2",type:"chef",
                        url:"http://www.google.com",branch:"Branch_2"}),
                    new ConfigModel({
                        _id:"0000003",org_id:"3000000",name:"Puppet Manager 1",type:"puppet",
                        url:"http://www.google.com",branch:"Branch_3"}),
                    new ConfigModel({
                        _id:"0000004",org_id:"4000000",name:"Puppet Manager 2",type:"puppet",
                        url:"http://www.google.com",branch:"Branch_4"}),
                    new ConfigModel({
                        _id:"0000005",org_id:"5000000",name:"Salt Manager 1",type:"salt",
                        url:"http://www.google.com",branch:"Branch_5"}),
                    new ConfigModel({
                        _id:"0000006",org_id:"6000000",name:"Salt Manager 2",type:"salt",
                        url:"http://www.google.com",branch:"Branch_6"}),
                    new ConfigModel({
                        _id:"0000007",org_id:"7000000",name:"Ansible Manager 1",type:"ansible",
                        url:"http://www.google.com",branch:"Branch_7"}),
                    new ConfigModel({
                        _id:"0000008",org_id:"8000000",name:"Ansible Manager 2",type:"ansible",
                        url:"http://www.google.com",branch:"Branch_8"})
                ]);

                var devOpsToolsManagementView = new DevOpsToolsManagementView({rootView:cloudSetupView});
                devOpsToolsManagementView.configManagers = collection;
                devOpsToolsManagementView.renderConfigManagers();

                expect($('.manager_list:eq(0) p', '#config_managers_page').length).toEqual(2);
                expect($('.manager_list:eq(1) p', '#config_managers_page').length).toEqual(2);
                expect($('.manager_list:eq(2) p', '#config_managers_page').length).toEqual(2);
                expect($('.manager_list:eq(3) p', '#config_managers_page').length).toEqual(2);
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
