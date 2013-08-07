/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true */
define([
        'jquery',
        'underscore',
        'backbone',
        'views/resource/resourceAppView',
        'text!templates/aws/iam/awsGroupAppTemplate.html',
        '/js/aws/models/iam/awsGroup.js',
        '/js/aws/collections/iam/awsGroups.js',
        '/js/aws/collections/iam/awsGroupUsers.js',
        '/js/aws/views/iam/awsGroupCreateView.js',
        '/js/aws/views/iam/awsAddUsersToGroupView.js',
        'icanhaz',
        'common'
], function( $, _, Backbone, ResourceAppView, GroupAppTemplate, Group, Groups, GroupUsers, GroupCreateView, AddUsersToGroupView, ich, Common ) {
    'use strict';

    var AwsGroupsAppView = ResourceAppView.extend({

        template: _.template(GroupAppTemplate),
        
        modelStringIdentifier: "GroupName",
        
        columns: ["GroupName"],
        
        idColumnNumber: 0,
        
        model: Group,
        
        collectionType: Groups,

        type: "iam",
        
        subtype: "groups",

        CreateView: GroupCreateView,

        selectedGroupUsers: undefined,
        
        events: {
            'click .create_button': 'createNew',
            'click #action_menu ul li': 'performAction',
            'click #resource_table tr': "clickOne",
            'click #users' : 'refreshUsersTab',
            'click .remove_user_from_group': 'removeUserFromGroup',
            'click #add_users_to_group_button': 'addUsersToGroup'
        },

        initialize: function(options) {
            if(options.cred_id) {
                this.credentialId = options.cred_id;
            }
            this.render();
            
            var groupApp = this;
            Common.vent.off("groupAppRefresh");
            Common.vent.on("groupAppRefresh", function() {
                groupApp.render();
            });
            Common.vent.off("groupUsersRefresh");
            Common.vent.on("groupUsersRefresh", function() {
                groupApp.refreshUsersTab();
            });
        },
        
        toggleActions: function(e) {
            //Disable any needed actions
        },
        
        performAction: function(event) {
            var group = this.collection.get(this.selectedId);
            
            switch(event.target.text)
            {
            case "Delete Group":
                group.destroy(this.credentialId);
                break;
            }
        },

        refreshUsersTab: function() {
            $("#users_tab_content").empty();
            $("#users_tab_content").append("<div>" +
                                                    "<div style='padding-bottom:10px;'>" +
                                                        "<button id='add_users_to_group_button'>Add Users to Group</button>" +
                                                    "</div>" +
                                                    "<table id='group_users_table'>" +
                                                        "<thead>" +
                                                            "<tr>" +
                                                                "<th>User Name</th><th>Actions</th>" +
                                                            "</tr>" +
                                                        "</thead>" +
                                                        "<tbody></tbody><tfoot></tfoot>" +
                                                    "</table>" +
                                                "</div>");
            $("#group_users_table").dataTable({
                "bJQueryUI": true,
                "sDom": 't',
                "sScrollY": "300px",
                "bPaginate": false,
                "bScrollCollapse": true
            });
            $("#add_users_to_group_button").button();
            $("#add_users_to_group_button").attr("disabled", true);
            $("#add_users_to_group_button").addClass("ui-state-disabled");
            this.selectedGroupUsers = new GroupUsers({"group_name": this.selectedId});
            this.selectedGroupUsers.on('reset', this.addAllGroupUsers, this);
            this.selectedGroupUsers.fetch({ data: $.param({ cred_id: this.credentialId, group_name: this.selectedId}), reset: true});
        },

        addAllGroupUsers: function() {
            $("#group_users_table").dataTable().fnClearTable();
            this.selectedGroupUsers.each(function(groupUser) {
                var rowData = [groupUser.attributes.UserName, "<a name="+ groupUser.attributes.UserName +" href='' class='remove_user_from_group'>Remove from group</a>"];
                $("#group_users_table").dataTable().fnAddData(rowData);
            });
            $("#add_users_to_group_button").attr("disabled", false);
            $("#add_users_to_group_button").removeClass("ui-state-disabled");
        },

        addUsersToGroup: function() {
            var group = this.collection.get(this.selectedId);
            new AddUsersToGroupView({cred_id: this.credentialId, group: group, group_users: this.selectedGroupUsers.toJSON()});
        },

        removeUserFromGroup: function(event) {
            var group = this.collection.get(this.selectedId);
            var user = {id: event.target.name};
            group.removeUser(user, this.credentialId);
            return false;
        }
    });
    
    return AwsGroupsAppView;
});
