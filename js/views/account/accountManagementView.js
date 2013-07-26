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
        'views/account/cloudAccountCreateView',
        'views/account/groupCreateView',
        'views/account/cloudAccountManagementView',
        'views/account/cloudCredentialManagementView',
        'views/account/usersManagementView',
        'views/account/groupsManagementView',
        'jquery-plugins',
        'jquery-ui-plugins',
        'jquery.jstree'
], function( $, _, Backbone, Common, managementTemplate, Groups, CloudCredentials, CloudAccounts, CloudAccountCreate, CreateGroupView, CloudAccountManagementView, CloudCredentialManagementView, UsersManagementView, GroupsManagementView ) {

    var AccountManagementView = Backbone.View.extend({
        /** @type {String} DOM element to attach view to */
        el: "#main",
        /** @type {Template} HTML template to generate view from */
        template: _.template(managementTemplate),
        /** @type {Object} Object of events for view to listen on */
        events: {
            "click .account_list": "selectManagement",
            "click .group_item": "selectGroup",
            "click #treeAddGroup": "addGroup",
            "click .cloud_account_item": "selectCloudAccount",
            "click #treeAddCloudAccount": "addCloudAccount",
            "click .credential_item": "selectCloudCred"
        },
        subApp: undefined,
        tree: undefined,
        groups: new Groups(),
        cloudCredentials: new CloudCredentials(),
        cloudAccounts: new CloudAccounts(),
        treeGroup: undefined,
        treeCloudAccount: undefined,
        treeCloudCred: undefined,
        /** Constructor method for current view */
        initialize: function() {
            this.subViews = [];
            //Render my template
            this.$el.html(this.template);
            
            this.groups.on('reset', this.addAllGroups, this);
            
            this.cloudCredentials.on( 'reset', this.addAllCreds, this );
            
            this.cloudAccounts.on( 'reset', this.addAllCloudAccounts, this );
            
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
            }).on('loaded.jstree', function() {$("#mUser_tree").jstree('open_all');});
            
        },
        addAllGroups: function() {
            $('.group_item').remove();
            $('.group_item_add').remove();
            this.groups.each(function(group) {
                $("#mGroup_tree").jstree("create","#group_list","first",{ attr : {class : "group_item"} , data : { title: group.attributes.name, attr : { id : group.attributes.id, href : "#account/management/groups", class : "group_item" }} },false, true);
            });
            $("#mGroup_tree").jstree("create","#group_list","first",{ attr : {class : "group_item_add"} , data : { title: "Create Group", attr : { id : "treeAddGroup", href : "#account/management/groups", class : "group_item_add" }} },false, true);
            
            if(this.groups.get(this.treeGroup) && typeof(this.subApp.treeSelect) !== "undefined"){
                this.subApp.treeSelect();
            }else{
                $("#selected_group_name").html("No Group Selected");
            }
        },
        addAllCreds: function(){
            $('.credential_item').remove();
            this.cloudCredentials.each(function(cred) {
                $("#mCloudCredential_tree").jstree("create","#cred_list","first",{ attr : {class : "credential_item"} , data : { title: cred.attributes.name, attr : { id : cred.attributes.id, href : "#account/management/cloud-credentials", class : "credential_item" }} },false, true);
            });
        },
        
        addAllCloudAccounts: function(){
            $('.cloud_account_item').remove();
            $('.cloud_account_item_add').remove();
            this.cloudAccounts.each(function(c_account) {
                $("#mCloudAccount_tree").jstree("create","#c_account_list","first",{ attr : {class : "cloud_account_item"} , data : { title: c_account.attributes.name, attr : { id : c_account.attributes.id, href : "#account/management/cloud-accounts", class : "cloud_account_item" }} },false, true);
            });
            
            $("#mCloudAccount_tree").jstree("create","#c_account_list","first",{ attr : {class : "cloud_account_item_add"} , data : { title: "Create Cloud Account", attr : { id : "treeAddCloudAccount", href : "#account/management/cloud-accounts", class : "cloud_account_item_add" }} },false, true);
            
            //debugger
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
                location.href = event.target.attributes.href.nodeValue;
            }
        },
        selectGroup: function(event){
            this.treeGroup = event.target.id;
            if(typeof(this.subApp.treeSelect) !== "undefined"){
                this.subApp.treeSelect();
            }
        },
        addGroup: function(event){
            if(event.target.id == "treeAddGroup"){
                new CreateGroupView();
            }
        },
        selectCloudAccount: function(event){
            this.treeCloudAccount = event.target.id;
            if(typeof(this.subApp.treeSelectCloudAccount) !== "undefined"){
                this.subApp.treeSelectCloudAccount();
            }  
        },
        addCloudAccount: function(event){
            if(event.target.id == "treeAddCloudAccount"){
                var caCreate = new CloudAccountCreate({ org_id: sessionStorage.org_id, account_id: sessionStorage.account_id});
                caCreate.render();
            }
        },
        selectCloudCred: function(event){
            this.treeCloudCred = event.target.id;
            if(typeof(this.subApp.treeSelectCloudCred) !== "undefined"){
                this.subApp.treeSelectCloudCred();
            }
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
        }
    }, Common);

    return AccountManagementView;
});
