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
        'text!templates/account/policyManagementTemplate.html',
        'models/policy',
        'collections/users',
        'views/account/groupCreateView',
        'views/account/groupManageUsersView',
        'jquery.dataTables',
        'jquery.dataTables.fnProcessingIndicator',
        'bootstrap'
], function( $, _, Backbone, Common, groupsManagementTemplate, Policy, Users, CreateGroupView, ManageGroupUsers ) {

    var GroupManagementView = Backbone.View.extend({

        tagName: 'div',

        template: _.template(groupsManagementTemplate),
        
        rootView: undefined,

        policy: undefined,
        
        users: undefined,

        selectedGroup: undefined,

        events: {
            "click #manage_group_users_button" : "manageGroupUsers",
            "click #save_button" : "savePolicy"
        },

        initialize: function() {
            this.$el.html(this.template);
            this.rootView = this.options.rootView;
            $("#submanagement_app").html(this.$el);
            //$("button").button();
            $("#group_users_table").dataTable({
                "bJQueryUI": true,
                "bProcessing": true
            });
            var groupsView = this;
            Common.vent.off("groupRefresh");
            Common.vent.on("groupRefresh", function() {
                groupsView.render();
                //refetch tree groups
                
            });
            this.users = new Users();
            this.selectedGroup = undefined;
            
            //this.policy = options.policy;
            
            this.render();
        },

        render: function () {
            this.disableSelectionRequiredButtons(false);
            /*$("#group_users_table").dataTable().fnClearTable();
            
            this.groups.fetch({
                data: $.param({ group_policy_id: this.rootView.treePolicy }),
                reset: true
            });*/
            
            //var view = this;
            //var policyName = view.rootView.policies.get(view.rootView.treePolicy).attributes.name;
            //$("#selected_group_name").append(policyName);
        },
        
        treeSelect: function() {
            this.clearSelection();
            this.render();
        },
        /*
        addAllGroupUsers: function() {
            
            $("#group_users_table").dataTable().fnClearTable();
            $.each(this.groups.models, function(index, value) {
                var rowData = [value.attributes.name, value.attributes.who, value.attributes.what, value.attributes.action];
                $("#group_users_table").dataTable().fnAddData(rowData);
            });
        },*/

        disableSelectionRequiredButtons: function(toggle) {
            
            if(toggle) {
                $("#delete_group_button").attr("disabled", true);
                $("#delete_group_button").addClass("ui-state-disabled");
                $("#delete_group_button").removeClass("ui-state-hover");
                $("#manage_group_users_button").attr("disabled", true);
                $("#manage_group_users_button").addClass("ui-state-disabled");
            }else {
                $("#delete_group_button").removeAttr("disabled");
                $("#delete_group_button").removeClass("ui-state-disabled");
                $("#manage_group_users_button").removeAttr("disabled");
                $("#manage_group_users_button").removeClass("ui-state-disabled");
            }
            
            //check admin
            this.adminCheck();
            
        },
        
        adminCheck: function(){
            var groupsView = this;
            groupsView.users.fetch({success: function(){
                var isAdmin = false;
                if(groupsView.users.get(sessionStorage.account_id).attributes.permissions.length > 0){
                    isAdmin = groupsView.users.get(sessionStorage.account_id).attributes.permissions[0].permission.name === "admin";
                }
                if(!isAdmin){
                    $("#delete_group_button").attr("disabled", true);
                    $("#delete_group_button").addClass("ui-state-disabled");
                    $("#delete_group_button").removeClass("ui-state-hover");
                    $("#manage_group_users_button").attr("disabled", true);
                    $("#manage_group_users_button").addClass("ui-state-disabled");
                }
            }});
        },
        /*
        createGroup: function() {
            new CreateGroupView();
        },

        deleteGroup: function() {
            if(this.selectedGroup) {
                this.selectedGroup.destroy();
            }
        },
        */
        manageGroupUsers: function() {
            if(this.selectedGroup) {
                new ManageGroupUsers({group_id: this.selectedGroup.attributes.id});
            }else {
                Common.errorDialog("Error", "Group is not selected.");
            }
        },

        clearSelection: function() {
            this.selectedGroup = undefined;
            $(".group_item").removeClass("selected_item");
        },
        
        savePolicy: function(){
            
            alert("save!");
        },

        close: function(){
            this.$el.remove();
        }  
    });

    return GroupManagementView;
});