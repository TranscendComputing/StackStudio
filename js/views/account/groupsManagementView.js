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
        'text!templates/account/groupsManagementTemplate.html',
        'collections/groups',
        'collections/users',
        'collections/policies',
        'models/policy',
        'views/account/groupCreateView',
        'views/account/groupManageUsersView',
        'jquery.dataTables',
        'jquery.dataTables.fnProcessingIndicator'
], function( $, _, Backbone, Common, groupsManagementTemplate, Groups, Users, Policies, Policy, CreateGroupView, ManageGroupUsers ) {

    var GroupManagementView = Backbone.View.extend({

        tagName: 'div',

        template: _.template(groupsManagementTemplate),
        
        rootView: undefined,

        groups: undefined,
        
        users: new Users(),
        
        policies: undefined,

        selectedGroup: undefined,

        events: {
            "click #create_group_button" : "createGroup",
            "click #delete_group_button" : "deleteGroup",
            "click #manage_group_users_button" : "manageGroupUsers",
            "change #policy_select":"policySelect"
        },

        initialize: function() {
            this.$el.html(this.template);
            this.rootView = this.options.rootView;
            $("#submanagement_app").html(this.$el);
            $("button").button();
            $("#group_users_table").dataTable({
                "bJQueryUI": true,
                "bProcessing": true
            });
            var groupsView = this;
            Common.vent.off("groupRefresh");
            Common.vent.on("groupRefresh", function() {
                $("#save_alert").fadeIn("slow").animate({opacity: 1.0}, 3000).fadeOut("slow");
                groupsView.refreshSession();
                groupsView.render();
                //refetch tree groups
            });
            this.selectedGroup = undefined;
            this.groups = this.rootView.groups;
            this.policies = this.rootView.policies;
            this.render();
        },

        render: function () {
            this.disableSelectionRequiredButtons(true);
            $("#group_users_table").dataTable().fnClearTable();
            
            this.groups.fetch({
                reset: true
            });
        },
        
        treeSelect: function() {
            this.clearSelection();
            //$(event.target).addClass("selected_item");
            this.selectedGroup = this.rootView.groups.get(this.rootView.treeGroup);
            $("#selected_group_name").html(this.selectedGroup.attributes.name);
            this.disableSelectionRequiredButtons(false);
            this.addAllGroupUsers();
        },

        addAllGroupUsers: function() {
            $("#group_users_table").dataTable().fnClearTable();
            $.each(this.selectedGroup.attributes.group_memberships, function(index, value) {
                var rowData = [value.group_membership.account.login, value.group_membership.account.first_name, value.group_membership.account.last_name];
                $("#group_users_table").dataTable().fnAddData(rowData);
            });
            $("#policy_select").empty();
            $("#policy_select").append('<option>None</option>');
            this.policies.each( function(policy) {
                $("#policy_select").append('<option value="'+policy.attributes._id+'">'+policy.attributes.name+'</option>');
            });
            if(typeof this.selectedGroup.attributes.group_policy !== 'undefined'){
                $("#policy_select").val(this.selectedGroup.attributes.group_policy.group_policy.id);
            }
        },

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
                    $("#policy_select").attr("disabled",true);
                    $("#policy_select").addClass("ui-state-disabled");
                }
            }});
        },

        createGroup: function() {
            new CreateGroupView();
        },

        deleteGroup: function() {
            if(this.selectedGroup) {
                this.selectedGroup.destroy();
            }
        },

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
        
        policySelect: function(event){
            //if(event.target.value !== "None"){
                var options = {};
                options.group_policy_id = event.target.value;
                options.group_id = this.selectedGroup.id;
                var newPolicy = new Policy();
                newPolicy.addToGroup(options,sessionStorage.org_id,sessionStorage.login);
                //}
        },
        
        refreshSession: function(){
            var url = Common.apiUrl + "/identity/v1/accounts/auth/" + sessionStorage.account_id;
            
            $.ajax({
                url: url,
                type: 'GET',
                contentType: 'application/x-www-form-urlencoded',
                success: function(data) {
                    sessionStorage.group_policies = JSON.stringify(data.account.group_policies);
                },
                error: function(jqXHR) {
                    Common.errorDialog(jqXHR.statusText, jqXHR.responseText);
                }
            });
        },

        close: function(){
            this.$el.remove();
        }  
    });

    return GroupManagementView;
});