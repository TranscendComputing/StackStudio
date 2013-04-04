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
        'views/account/groupCreateView',
        'views/account/groupManageUsersView',
        'jquery.dataTables',
        'jquery.dataTables.fnProcessingIndicator'
], function( $, _, Backbone, Common, groupsManagementTemplate, Groups, CreateGroupView, ManageGroupUsers ) {

    var GroupManagementView = Backbone.View.extend({

        tagName: 'div',

        template: _.template(groupsManagementTemplate),

        groups: undefined,

        selectedGroup: undefined,

        events: {
            "click .group_item" : "selectGroup",
            "click #create_group_button" : "createGroup",
            "click #delete_group_button" : "deleteGroup",
            "click #manage_group_users_button" : "manageGroupUsers"
        },

        initialize: function() {
            this.$el.html(this.template);
            $("#submanagement_app").html(this.$el);
            $("button").button();
            $("#group_users_table").dataTable({
                "bJQueryUI": true,
                "bProcessing": true
            });
            var groupsView = this;
            Common.vent.off("groupRefresh");
            Common.vent.on("groupRefresh", function() {
                groupsView.render();
            });
            this.selectedGroup = undefined;
            this.groups = new Groups();
            this.groups.on('reset', this.addAllGroups, this);
            this.render();
        },

        render: function () {
            this.disableSelectionRequiredButtons(true);
            $("#group_users_table").dataTable().fnClearTable();
            this.groups.fetch({
                reset: true
            });
        },

        addAllGroups: function() {
            var view = this;
            $("#groups_menu_list").empty();
            this.groups.each(function(group) {
                if(view.selectedGroup && view.selectedGroup.attributes.id === group.attributes.id) {
                    $("#groups_menu_list").append("<li id=" + group.attributes.id + " class='group_item selected_item'>" + group.attributes.name + "</li>");
                    //refresh selectedGroup
                    view.selectedGroup = group;
                    view.disableSelectionRequiredButtons(false);
                    view.addAllGroupUsers();
                }else {
                    $("#groups_menu_list").append("<li id=" + group.attributes.id + " class='group_item'>" + group.attributes.name + "</li>");
                }
            });
        },

        selectGroup: function(event) {
            this.clearSelection();
            $(event.target).addClass("selected_item");
            this.selectedGroup = this.groups.get(event.target.id);
            this.disableSelectionRequiredButtons(false);
            this.addAllGroupUsers();
        },

        addAllGroupUsers: function() {
            $("#group_users_table").dataTable().fnClearTable();
            $.each(this.selectedGroup.attributes.group_memberships, function(index, value) {
                var rowData = [value.group_membership.account.login, value.group_membership.account.first_name, value.group_membership.account.last_name];
                $("#group_users_table").dataTable().fnAddData(rowData);
            });
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

        close: function(){
            this.$el.remove();
        }  
    });

    return GroupManagementView;
});