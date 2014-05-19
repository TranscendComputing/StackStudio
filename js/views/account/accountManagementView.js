/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true requirejs:true require:true*/
define([
        'jquery',
        'underscore',
        'backbone',
        'common',
        'text!templates/account/managementTemplate.html',
        'collections/groups',
        'collections/cloudCredentials',
        'collections/cloudAccounts',
        'collections/policies',
        'views/account/newLoginView',
        'views/account/cloudAccountManagementView',
        'views/account/cloudCredentialManagementView',
        'views/account/cloudCredentialManagementListView',
        'views/account/cloudAccountManagementListView',
        'views/account/usersManagementView',
        'views/account/policiesManagementView',
        'views/account/policyManagementView',
        'views/account/homeView',
        'views/account/groupsManagementView',
        'views/account/groupsManagementListView',
        'views/account/devOpsToolsManagementView',
        'views/account/continuousIntegrationManagementView',
        'views/account/sourceControlRepositoryManagementListView',
        'views/firstTimeTutorialView',
        'jquery-plugins',
        'jquery-ui-plugins',
        'jquery.jstree'
    ],
    function($, _, Backbone, Common, managementTemplate, Groups, CloudCredentials,
             CloudAccounts, Policies, NewLoginView, CloudAccountManagementView,
             CloudCredentialManagementView, CloudCredentialManagementListView,
             CloudAccountManagementListView, UsersManagementView, PoliciesManagementView,
             PolicyManagementView, HomeView, GroupsManagementView, GroupsManagementListView,
             DevOpsToolsManagementView, ContinuousIntegrationManagementView,
             SourceControlRepositoryManagementListView, TutorialView ) {

        var AccountManagementView = Backbone.View.extend({
            /** @type {String} DOM element to attach view to */
            el: "#main",
            /** @type {Template} HTML template to generate view from */
            template: _.template(managementTemplate),
            /** @type {Object} Object of events for view to listen on */
            events: {
                "click .account_list": "selectManagement",
                "click .group_item": "selectGroup",
                "click .cloud_account_item": "selectCloudAccount",
                "click .credential_item": "selectCloudCred",
                "click .policy_item": "selectPolicy",
                "click #treeAddUser": "addUser"
            },
            subApp: undefined,
            tree: undefined,
            groups: undefined,
            cloudCredentials: undefined,
            cloudAccounts: undefined,
            policies: undefined,
            treeGroup: undefined,
            treeCloudAccount: undefined,
            treeCloudCred: undefined,
            treePolicy: undefined,
            afterSubAppRender: undefined,
            /** Constructor method for current view */
            initialize: function() {
                //Render my template
                this.$el.html(this.template);
    
                this.groups = new Groups();
                this.groups.on('reset', this.addAllGroups, this);
    
                this.cloudCredentials = new CloudCredentials();
                this.cloudCredentials.on( 'reset', this.addAllCreds, this );

                this.cloudCredentials.fetch({
                    data: $.param({ org_id: sessionStorage.org_id, account_id: sessionStorage.account_id}),
                    reset: true
                });
    
                this.cloudAccounts = new CloudAccounts();
                this.cloudAccounts.on( 'reset', this.addAllCloudAccounts, this );
    
                this.policies = new Policies();
                this.policies.on( 'reset', this.addAllPolicies, this );
    
                //Render my own views
                this.render();
    
                if (sessionStorage && parseInt(sessionStorage.num_logins, 10) < 5)  {//todo: change this to 0
                    this.tutorial = new TutorialView({ rootView: this });
    
                    this.afterSubAppRender = function () {
                        this.tutorial.update();
                    }.bind(this);
    
                    this.tutorial.render();
                }
                window.jQuery = $;
                window.$ = $;
            },

            /** Add all of my own html elements */
            render: function () {
                var accMan = this;
    
                $(document).on('click', '#management_tree li', function () {
                    $('#management_tree li.active').removeClass('active');
                    $(this).addClass('active');
    
                    $(this).find('ul').toggleClass('open');
                });
            },
    
            addAllGroups: function() {
                $('#group_list').empty();
                this.groups.each(function ( group ) {
                    $('#group_list').append('<li><a href="#">' + group.attributes.name + '</a></li>');
                });
            },

            addAllCreds: function(){
                $('#cred_list').empty();
                this.cloudCredentials.each(function ( cred ) {
                    $('#cred_list').append('<li><a id="' + cred.attributes.id + '" class="credential_item" href="#">' + cred.attributes.name + '</a></li>');
                });
            },

            addAllPolicies: function(){
                $('#policy_list').empty();
                this.policies.each(function ( policy ) {
                    $('#policy_list').append('<li><a id="' + policy.attributes.id + '" class="policy_item" href="#">' + policy.attributes.name + '</a></li>');
                });
            },

            addAllCloudAccounts: function(){
                $('#cloud_account_list').empty();
                this.cloudAccounts.each(function ( acc ) {
                   $('#cloud_account_list').append('<li><a id="' + acc.attributes.id + '" class="cloud_account_item" href="#">' + acc.attributes.name + '</a></li>'); 
                });
                // $('.cloud_account_item.tree_item').remove();
    
                // this.cloudAccounts.each(function(c_account) {
                //     $("#mCloudAccount_tree").jstree("create","#c_account_list","first",{ attr : {class : "cloud_account_item tree_item"} , data : { title: c_account.attributes.name, attr : { id : c_account.attributes.id, href : "#account/management/cloud-accounts", class : "cloud_account_item tree_item" }} },false, true);
                // });
    
                // if(!this.treeCloudAccount){
                //     this.treeCloudAccount = this.cloudAccounts.models[this.cloudAccounts.length-1].id;
                // }
                // if(this.cloudAccounts.get(this.treeCloudAccount) && typeof(this.subApp.treeSelectCloudAccount) !== "undefined"){
                //     this.subApp.treeSelectCloudAccount();
                // }else if(typeof(this.subApp.treeSelectCloudAccount) !== "undefined"){
                //     this.treeCloudAccount = this.cloudAccounts.models[this.cloudAccounts.length-1].id;
                //     this.subApp.treeSelectCloudAccount();
                // }
            },
    
            selectManagement: function(event) {
                var self = this;
                if (event.target.attributes.href) {
                    if ($("#"+event.target.id).hasClass('policy_item')) {
                        this.treePolicy = event.target.id;
                    }
    
                    //if no hash change, go ahead and run the after render logic anyway
                    var currentHash = location.href.split('#');
                    if (currentHash.length > 1) {
                        currentHash = currentHash[1];
                        var newHash = event.target.attributes.href.nodeValue.split('#');
    
                        if (newHash.length > 1) {
                            newHash = newHash[1];
    
                            if (currentHash === newHash) {
                                if (this.afterSubAppRender) {
                                    //make sure other event handlers are registered first
                                    setTimeout(function () {
                                        self.afterSubAppRender();
                                    }, 5);
                                    return;
                                }
                            }
                        }
                    }
                    location.href = event.target.attributes.href.nodeValue;
                }
            },
    
            selectGroup: function(event) {
                this.treeGroup = event.target.id;
                if (typeof(this.subApp.treeSelect) !== "undefined") {
                    this.subApp.treeSelect();
                }
            },
    
            selectCloudAccount: function(event) {
                this.treeCloudAccount = event.target.id;
                if (typeof(this.subApp.treeSelectCloudAccount) !== "undefined") {
                    this.subApp.treeSelectCloudAccount();
                }
            },
    
            selectCloudCred: function(event) {
                this.treeCloudCred = event.target.id;
                if (typeof(this.subApp.treeSelectCloudCred) !== "undefined") {
                    this.subApp.treeSelectCloudCred();
                }
            },
    
            selectPolicy: function(event) {
                this.treePolicy = event.target.id;
                if (typeof(this.subApp.treeSelect) !== "undefined") {
                    this.subApp.treeSelect();
                }
            },

            addUser: function(event) {
                new NewLoginView({org_id: sessionStorage.org_id});
            },
    
            close: function() {
                this.$el.empty();
                this.undelegateEvents();
                this.stopListening();
                this.unbind();
                // handle other unbinding needs, here
                _.each(this.subViews, function(childView) {
                  if (childView.close) {
                    childView.close();
                  }
                });
            }
        });
    
        /** Variable to track whether view has been initialized or not */
        var accountManagementView;
        var self = this;
        Common.router.on("route:accountManagement", function (action) {
            if (this.previousView !== accountManagementView) {
                this.unloadPreviousState();
                accountManagementView = new AccountManagementView();
                this.setPreviousState(accountManagementView);
            }

            var actionMap = {
                'cloud-accounts': CloudAccountManagementView,
                'cloud-credentials': CloudCredentialManagementView,
                'users': UsersManagementView,
                'policies': PoliciesManagementView,
                'policy': PoliciesManagementView,
                'groups': GroupsManagementView,
                'groups_list': GroupsManagementListView,
                'cloud-credentials_list': CloudCredentialManagementListView,
                'cloud-accounts_list': CloudAccountManagementListView,
                'configuration_managers': DevOpsToolsManagementView,
                'continuous_integration': ContinuousIntegrationManagementView,
                'source_control_repositories': SourceControlRepositoryManagementListView,
                'home': HomeView
            };

            var TargetView = actionMap[action];

            /* Common instruction for entire switch statement above */
            if (! (accountManagementView.subApp instanceof TargetView)) {
                if (accountManagementView.subApp !== undefined) {
                    accountManagementView.subApp.close();
                }
                var args = (TargetView === UsersManagementView) ? {} : {rootView: accountManagementView};
                accountManagementView.subApp = new TargetView(args);
            }
    
            if (accountManagementView.afterSubAppRender) {
                accountManagementView.afterSubAppRender.call(accountManagementView);
            }
        }, Common);
    
        return AccountManagementView;
    }
);
