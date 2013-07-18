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
        'views/account/cloudAccountManagementView',
        'views/account/cloudCredentialManagementView',
        'views/account/usersManagementView',
        'views/account/groupsManagementView',
        'jquery-plugins',
        'jquery-ui-plugins',
        'jquery.jstree'
], function( $, _, Backbone, Common, managementTemplate, Groups, CloudAccountManagementView, CloudCredentialManagementView, UsersManagementView, GroupsManagementView ) {

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
        treeGroup: undefined,
        /** Constructor method for current view */
        initialize: function() {
            this.subViews = [];
            //Render my template
            this.$el.html(this.template);
            
            this.groups = new Groups();
            this.groups.on('reset', this.addAllGroups, this);
            //Render my own view
            this.render();
        },
        /** Add all of my own html elements */
        render: function () {
            this.groups.fetch({
                reset: true
            });
            //$("ul#account_management_menu").menu({role: "listbox"});
            
            //$("#management_tree").jstree();
            
        },
        addAllGroups: function() {
            //debugger
            $("#groups_sub_list").empty();
            this.groups.each(function(group) {
                $("#groups_sub_list").append("<li><a id='" + group.attributes.id + "' href='#account/management/groups' class='group_item'>" + group.attributes.name + "</a></li>");
            });
            this.tree = $("#management_tree").jstree();
            
            if(this.groups.get(this.treeGroup)){
                this.subApp.treeSelect();
            }else{
                $("#selected_group_name").html("No Group Selected");
            }
        },
        selectManagement: function(event){
            if(event.target.attributes.href){
                location.href = event.target.attributes.href.nodeValue;
            }
        },
        selectGroup: function(event){
            this.treeGroup = event.target.id;
            //debugger
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
