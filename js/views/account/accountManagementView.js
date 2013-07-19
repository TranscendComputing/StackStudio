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
        'views/account/cloudAccountManagementView',
        'views/account/cloudCredentialManagementView',
        'views/account/usersManagementView',
        'views/account/groupsManagementView',
        'jquery-plugins',
        'jquery-ui-plugins',
        'jquery.jstree'
], function( $, _, Backbone, Common, managementTemplate, Groups, CloudCredentials, CloudAccounts, CloudAccountManagementView, CloudCredentialManagementView, UsersManagementView, GroupsManagementView ) {

    var AccountManagementView = Backbone.View.extend({
        /** @type {String} DOM element to attach view to */
        el: "#main",
        /** @type {Template} HTML template to generate view from */
        template: _.template(managementTemplate),
        /** @type {Object} Object of events for view to listen on */
        events: {
            "click .account_list": "selectManagement",
            "click .group_item": "selectGroup"
        },
        subApp: undefined,
        tree: undefined,
        groups: undefined,
        cloudCredentials: new CloudCredentials(),
        cloudAccounts: new CloudAccounts(),
        treeGroup: undefined,
        /** Constructor method for current view */
        initialize: function() {
            this.subViews = [];
            //Render my template
            this.$el.html(this.template);
            
            this.groups = new Groups();
            this.groups.on('reset', this.addAllGroups, this);
            
            this.cloudCredentials.on( 'reset', this.addAllCreds, this );
            
            this.cloudAccounts.on( 'reset', this.addAllCloudAccounts, this );
            
            //Render my own view
            this.render();
        },
        /** Add all of my own html elements */
        render: function () {
            $("#management_tree").jstree({"plugins":[ "themes", "html_data", "ui", "crrm" ]}).on('loaded.jstree', function() {$("#management_tree").jstree('open_all');});
            
            this.groups.fetch({
                reset: true
            });
        },
        addAllGroups: function() {
            $('.group_item').remove();
            this.groups.each(function(group) {
                $("#management_tree").jstree("create","#group_list","first",{ attr : {class : "group_item"} , data : { title: group.attributes.name, attr : { id : group.attributes.id, href : "#account/management/groups", class : "group_item" }} },false, true);
            });
            
            if(this.groups.get(this.treeGroup)){
                this.subApp.treeSelect();
            }else{
                $("#selected_group_name").html("No Group Selected");
            }
            
            //async
            this.cloudCredentials.fetch({reset: true});
        },
        
        addAllCreds: function(){
            $('.credential_item').remove();
            this.cloudCredentials.each(function(cred) {
                $("#management_tree").jstree("create","#cred_list","first",{ attr : {class : "credential_item"} , data : { title: cred.attributes.name, attr : { id : cred.attributes.id, href : "#account/management/cloud-credentials", class : "credential_item" }} },false, true);
            });
            
            this.cloudAccounts.fetch({ 
                data: $.param({ org_id: sessionStorage.org_id, account_id: sessionStorage.account_id}),
                reset: true
            });
        },
        
        addAllCloudAccounts: function(){
            $('.cloud_account_item').remove();
            this.cloudAccounts.each(function(c_account) {
                $("#management_tree").jstree("create","#c_account_list","first",{ attr : {class : "cloud_account_item"} , data : { title: c_account.attributes.name, attr : { id : c_account.attributes.id, href : "#account/management/cloud-accounts", class : "cloud_account_item" }} },false, true);
            });
        },
        
        selectManagement: function(event){
            if(event.target.attributes.href){
                location.href = event.target.attributes.href.nodeValue;
            }
        },
        selectGroup: function(event){
            this.treeGroup = event.target.id;
            if(typeof(this.subApp.treeSelect) != "undefined"){
                this.subApp.treeSelect();
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
                    accountManagementView.subApp = new CloudAccountManagementView();
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
                    accountManagementView.subApp = new CloudCredentialManagementView();
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
