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
        'jquery-plugins',
        'jquery-ui-plugins',
        'jquery.jstree'
], function( $, _, Backbone, Common, managementTemplate, Groups, CloudCredentials, CloudAccounts, Policies, NewLoginView, CloudAccountManagementView, CloudCredentialManagementView, CloudCredentialManagementListView, CloudAccountManagementListView, UsersManagementView, PoliciesManagementView, PolicyManagementView, HomeView, GroupsManagementView, GroupsManagementListView, DevOpsToolsManagementView ) {
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
        /** Constructor method for current view */
        initialize: function() {
            
            this.subViews = [];
            //Render my template
            this.$el.html(this.template);
            
            this.groups = new Groups();
            this.groups.on('reset', this.addAllGroups, this);
            
            this.cloudCredentials = new CloudCredentials();
            this.cloudCredentials.on( 'reset', this.addAllCreds, this );
            
            this.cloudAccounts = new CloudAccounts();
            this.cloudAccounts.on( 'reset', this.addAllCloudAccounts, this );
            
            this.policies = new Policies();
            this.policies.on( 'reset', this.addAllPolicies, this );
            
            //Render my own view
            this.render();
        },
        /** Add all of my own html elements */
        render: function () {
            var accMan = this;
            $("#mCloudAccount_tree").jstree({
                "themeroller":{"item": "jstree_custom_item"},
                "plugins":[ "themeroller", "html_data", "ui", "crrm" ]
            }).on('loaded.jstree', function() {
                //async
                accMan.cloudAccounts.fetch({
                    data: $.param({ org_id: sessionStorage.org_id, account_id: sessionStorage.account_id}),
                    reset: true
                });
            });
            $("#mCloudCredential_tree").jstree({
                "themeroller":{"item": "jstree_custom_item"},
                "plugins":[ "themeroller", "html_data", "ui", "crrm" ]
            }).on('loaded.jstree', function() {
                //async
                accMan.cloudCredentials.fetch({reset: true});
            });
            $("#mGroup_tree").jstree({
                "themeroller":{"item": "jstree_custom_item"},
                "plugins":[ "themeroller", "html_data", "ui", "crrm" ]
            }).on('loaded.jstree', function() {
                //Fetch Collections
                accMan.groups.fetch({
                    reset: true
                });
            });
            $("#mUser_tree").jstree({
                "themeroller":{"item": "jstree_custom_item"},
                "plugins":[ "themeroller", "html_data", "ui", "crrm" ]
            }).on('loaded.jstree', function() {
                $("#mUser_tree").jstree('open_all');
            });
            $("#mPolicy_tree").jstree({
                "themeroller":{"item": "jstree_custom_item"},
                "plugins":[ "themeroller", "html_data", "ui", "crrm" ]
            }).on('loaded.jstree', function() {
                //async
                accMan.policies.fetch({
                    data: $.param({ org_id: sessionStorage.org_id}),
                    reset: true
                });
            });
            $("#mdevOps_tree").jstree({
                "themeroller":{"item": "jstree_custom_item"},
                "plugins":[ "themeroller", "html_data", "ui", "crrm" ]
            }).on('loaded.jstree', function() {
                    $("#mdevOps_tree").jstree('open_all');
            });
        },
        addAllGroups: function() {
            $('.group_item.tree_item').remove();
            this.groups.each(function(group) {
                $("#mGroup_tree").jstree("create","#group_list","first",{ attr : {class : "group_item tree_item"} , data : { title: group.attributes.name, attr : { id : group.attributes.id, href : "#account/management/groups", class : "group_item tree_item" }} },false, true);
            });
            
            if(this.groups.get(this.treeGroup) && typeof(this.subApp.treeSelect) !== "undefined"){
                this.subApp.treeSelect();
            }else{
                $("#selected_group_name").html("No Group Selected");
            }
        },
        addAllCreds: function(){
            $('.credential_item.tree_item').remove();
            this.cloudCredentials.each(function(cred) {
                $("#mCloudCredential_tree").jstree("create","#cred_list","first",{ attr : {class : "credential_item tree_item"} , data : { title: cred.attributes.name, attr : { id : cred.attributes.id, href : "#account/management/cloud-credentials", class : "credential_item tree_item" }} },false, true);
            });
        },
        addAllPolicies: function(){
            $('.policy_item.tree_item').remove();
            this.policies.each(function(policy) {
                $("#mPolicy_tree").jstree("create","#policy_list","first",{ attr : {class : "policy_item tree_item"} , data : { title: policy.attributes.name, attr : { id : policy.attributes._id, href : "#account/management/policy", class : "policy_item tree_item" }} },false, true);
            });
        },
        addAllCloudAccounts: function(){
            $('.cloud_account_item.tree_item').remove();
            
            this.cloudAccounts.each(function(c_account) {
                $("#mCloudAccount_tree").jstree("create","#c_account_list","first",{ attr : {class : "cloud_account_item tree_item"} , data : { title: c_account.attributes.name, attr : { id : c_account.attributes.id, href : "#account/management/cloud-accounts", class : "cloud_account_item tree_item" }} },false, true);
            });
            
            if(!this.treeCloudAccount){
                this.treeCloudAccount = this.cloudAccounts.models[this.cloudAccounts.length-1].id;
            }
            
            if(this.cloudAccounts.get(this.treeCloudAccount) && typeof(this.subApp.treeSelectCloudAccount) !== "undefined"){
                this.subApp.treeSelectCloudAccount();
            }else if(typeof(this.subApp.treeSelectCloudAccount) !== "undefined"){
                this.treeCloudAccount = this.cloudAccounts.models[this.cloudAccounts.length-1].id;
                this.subApp.treeSelectCloudAccount();
            }
        },
        
        selectManagement: function(event){
            if(event.target.attributes.href){
                if($("#"+event.target.id).hasClass('policy_item')){
                    this.treePolicy = event.target.id;
                }
                location.href = event.target.attributes.href.nodeValue;
            }
        },
        selectGroup: function(event){
            this.treeGroup = event.target.id;
            if(typeof(this.subApp.treeSelect) !== "undefined"){
                this.subApp.treeSelect();
            }
        },
        selectCloudAccount: function(event){
            this.treeCloudAccount = event.target.id;
            if(typeof(this.subApp.treeSelectCloudAccount) !== "undefined"){
                this.subApp.treeSelectCloudAccount();
            }
        },
        selectCloudCred: function(event){
            this.treeCloudCred = event.target.id;
            if(typeof(this.subApp.treeSelectCloudCred) !== "undefined"){
                this.subApp.treeSelectCloudCred();
            }
        },
        selectPolicy: function(event){
            this.treePolicy = event.target.id;
            if(typeof(this.subApp.treeSelectCloudCred) !== "undefined"){
                this.subApp.treeSelect();
            }
        },
        addUser: function(event){
            new NewLoginView({org_id: sessionStorage.org_id});
        },
        close: function(){
            this.$el.empty();
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            // handle other unbinding needs, here
            _.each(this.subViews, function(childView){
              if (childView.close){
                childView.close();
              }
            });
        }
    });

    /** Variable to track whether view has been initialized or not */
    var accountManagementView;
    
    Common.router.on("route:accountManagement", function (action) {
        if (this.previousView !== accountManagementView) {
            this.unloadPreviousState();
            accountManagementView = new AccountManagementView();
            this.setPreviousState(accountManagementView);
        }
        switch(action)
        {
            case "cloud-accounts":
                if(accountManagementView.subApp instanceof CloudAccountManagementView)
                {
                    //do nothing
                }else{
                    if(accountManagementView.subApp !== undefined){
                        accountManagementView.subApp.close();
                    }
                    accountManagementView.subApp = new CloudAccountManagementView({rootView: accountManagementView});
                }
                break;
            case "cloud-credentials":
                if(accountManagementView.subApp instanceof CloudCredentialManagementView)
                {
                    //do nothing
                }else{
                    if(accountManagementView.subApp !== undefined){
                        accountManagementView.subApp.close();
                    }
                    accountManagementView.subApp = new CloudCredentialManagementView({rootView: accountManagementView});
                }
                break;
            case "users":
                if(accountManagementView.subApp instanceof UsersManagementView)
                {
                    //do nothing
                }else{
                    if(accountManagementView.subApp !== undefined){
                        accountManagementView.subApp.close();
                    }
                    accountManagementView.subApp = new UsersManagementView();
                }
                break;
            case "policies":
                if(accountManagementView.subApp instanceof PoliciesManagementView)
                {
                    //do nothing
                }else{
                    if(accountManagementView.subApp !== undefined){
                        accountManagementView.subApp.close();
                    }
                    accountManagementView.subApp = new PoliciesManagementView();
                }
                break;
            case "policy":
                if(accountManagementView.subApp instanceof PolicyManagementView)
                {
                    //do nothing
                }else{
                    if(accountManagementView.subApp !== undefined){
                        accountManagementView.subApp.close();
                    }
                    accountManagementView.subApp = new PolicyManagementView({rootView: accountManagementView});
                }
                break;
            case "groups":
                if(accountManagementView.subApp instanceof GroupsManagementView)
                {
                    //do nothing
                }else{
                    if(accountManagementView.subApp !== undefined){
                        accountManagementView.subApp.close();
                    }
                    accountManagementView.subApp = new GroupsManagementView({rootView: accountManagementView});
                }
                break;
            case "groups_list":
                if(accountManagementView.subApp instanceof GroupsManagementListView)
                {
                    //do nothing
                }else{
                    if(accountManagementView.subApp !== undefined){
                        accountManagementView.subApp.close();
                    }
                    accountManagementView.subApp = new GroupsManagementListView({rootView: accountManagementView});
                }
                break;
            case "cloud-credentials_list":
                if(accountManagementView.subApp instanceof CloudCredentialManagementListView)
                {
                    //do nothing
                }else{
                    if(accountManagementView.subApp !== undefined){
                        accountManagementView.subApp.close();
                    }
                    accountManagementView.subApp = new CloudCredentialManagementListView({rootView: accountManagementView});
                }
                break;
            case "cloud-accounts_list":
                if(accountManagementView.subApp instanceof CloudAccountManagementListView)
                {
                    //do nothing
                }else{
                    if(accountManagementView.subApp !== undefined){
                        accountManagementView.subApp.close();
                    }
                    accountManagementView.subApp = new CloudAccountManagementListView({rootView: accountManagementView});
                }
                break;
            case "devops":
                if(accountManagementView.subApp instanceof DevOpsToolsManagementView){

                }else{
                    if(accountManagementView.subApp !== undefined){
                        accountManagementView.subApp.close();
                    }
                    accountManagementView.subApp = new DevOpsToolsManagementView({rootView: accountManagementView});
                }
                break;
            case "home":
                if(accountManagementView.subApp instanceof HomeView)
                {
                    //do nothing
                }else{
                    if(accountManagementView.subApp !== undefined){
                        accountManagementView.subApp.close();
                    }
                    accountManagementView.subApp = new HomeView({rootView: accountManagementView});
                }
                break;
        }
    }, Common);

    return AccountManagementView;
});
