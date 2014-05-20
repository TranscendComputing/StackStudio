/*jshint smarttabs:true */
/*global loadFixtures:false */
define(
    [
        'jquery',
        'common',
        'views/account/accountManagementView',
        'views/account/cloudAccountManagementView',
        'text!templates/account/managementTemplate.html',
        'jasmine-jquery'
    ],
    function($, Common, AccountManagementView, CloudAccountManagementView, ManagementTemplate) {
        jasmine.getFixtures().fixturesPath = 'templates/';

        describe("Account Management View Tests", function() {
            var accountManagementView = new AccountManagementView();

            it("render is callable", function() {
                 var renderSpy = spyOn(accountManagementView, 'render');
                 accountManagementView.render();
                 expect(accountManagementView.render).toHaveBeenCalled();
            });

            it("addAllGroups is callable", function() {
                 var renderSpy = spyOn(accountManagementView, 'addAllGroups');
                 accountManagementView.addAllGroups();
                 expect(accountManagementView.addAllGroups).toHaveBeenCalled();
            });

            it("addAllCreds is callable", function() {
                 var renderSpy = spyOn(accountManagementView, 'addAllCreds');
                 accountManagementView.addAllCreds();
                 expect(accountManagementView.addAllCreds).toHaveBeenCalled();
            });

            it("addAllPolicies is callable", function() {
                 var renderSpy = spyOn(accountManagementView, 'addAllPolicies');
                 accountManagementView.addAllPolicies();
                 expect(accountManagementView.addAllPolicies).toHaveBeenCalled();
            });

            it("addAllCloudAccounts is callable", function() {
                 var renderSpy = spyOn(accountManagementView, 'addAllCloudAccounts');
                 accountManagementView.addAllCloudAccounts();
                 expect(accountManagementView.addAllCloudAccounts).toHaveBeenCalled();
            });

            it("selectManagement is callable", function() {
                 var renderSpy = spyOn(accountManagementView, 'selectManagement');
                 accountManagementView.selectManagement();
                 expect(accountManagementView.selectManagement).toHaveBeenCalled();
            });

            it("selectGroup is callable", function() {
                 var renderSpy = spyOn(accountManagementView, 'selectGroup');
                 accountManagementView.selectGroup();
                 expect(accountManagementView.selectGroup).toHaveBeenCalled();
            });

            it("selectCloudAccount is callable", function() {
                 var renderSpy = spyOn(accountManagementView, 'selectCloudAccount');
                 accountManagementView.selectCloudAccount();
                 expect(accountManagementView.selectCloudAccount).toHaveBeenCalled();
            });

            it("selectCloudCred is callable", function() {
                 var renderSpy = spyOn(accountManagementView, 'selectCloudCred');
                 accountManagementView.selectCloudCred();
                 expect(accountManagementView.selectCloudCred).toHaveBeenCalled();
            });

            it("selectPolicy is callable", function() {
                 var renderSpy = spyOn(accountManagementView, 'selectPolicy');
                 accountManagementView.selectPolicy();
                 expect(accountManagementView.selectPolicy).toHaveBeenCalled();
            });

            it("addUser is callable", function() {
                 var renderSpy = spyOn(accountManagementView, 'addUser');
                 accountManagementView.addUser();
                 expect(accountManagementView.addUser).toHaveBeenCalled();
            });

            it("close is callable", function() {
                 var renderSpy = spyOn(accountManagementView, 'close');
                 accountManagementView.close();
                 expect(accountManagementView.close).toHaveBeenCalled();
            });
        });

        describe("Account Management jQuery Bindings Tests", function() {
            var element;

            beforeEach(function() {
                // XXX - Probably have to loadFixture for each unit test
                // I think each action has its own template.
                loadFixtures('account/managementTemplate.html');
                element = $('#jasmine-fixtures');
            });

            it("trigger jQuery binding route:accountManagement sending cloud-accounts", function() {
                Common.router.trigger("route:accountManagement", 'cloud-accounts');
                //expect(Common.TargetView instanceof CloudAccountManagementView).toBeTruthy();
            });

            it("trigger jQuery binding route:accountManagement sending cloud-credentials", function() {
                Common.router.trigger("route:accountManagement", 'cloud-credentials');
            });

            it("trigger jQuery binding route:accountManagement sending users", function() {
                Common.router.trigger("route:accountManagement", 'users');
            });

            it("trigger jQuery binding route:accountManagement sending policies", function() {
                Common.router.trigger("route:accountManagement", 'policies');
            });

            it("trigger jQuery binding route:accountManagement sending policy", function() {
                Common.router.trigger("route:accountManagement", 'policy');
            });

            it("trigger jQuery binding route:accountManagement sending groups", function() {
                Common.router.trigger("route:accountManagement", 'groups');
            });

            it("trigger jQuery binding route:accountManagement sending groups_list", function() {
                Common.router.trigger("route:accountManagement", 'groups_list');
            });

            it("trigger jQuery binding route:accountManagement sending cloud-credentials_list", function() {
                Common.router.trigger("route:accountManagement", 'cloud-credentials_list');
            });

            it("trigger jQuery binding route:accountManagement sending cloud-accounts_list", function() {
                Common.router.trigger("route:accountManagement", 'cloud-accounts_list');
            });

            it("trigger jQuery binding route:accountManagement sending configuration_managers", function() {
                Common.router.trigger("route:accountManagement", 'configuration_managers');
            });

            it("trigger jQuery binding route:accountManagement sending continuous_integration", function() {
                Common.router.trigger("route:accountManagement", 'continuous_integration');
            });

            it("trigger jQuery binding route:accountManagement sending source_control_repositories", function() {
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
