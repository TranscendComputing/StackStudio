/*!
 * (c) Copyright 2012-2013 Transcend Computing, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the License);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an AS IS BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
        'text!templates/account/groupsManagementListTemplate.html',
        'collections/groups',
        'collections/users',
        'views/account/groupCreateView',
        'views/account/groupManageUsersView',
        'jquery.dataTables',
        'jquery.dataTables.fnProcessingIndicator'
], function( $, _, Backbone, Common, groupsManagementListTemplate, Groups, Users, CreateGroupView, ManageGroupUsers ) {

    var GroupsManagementListView = Backbone.View.extend({

        tagName: 'div',

        template: _.template(groupsManagementListTemplate),
        
        rootView: undefined,

        groups: undefined,
        
        users: new Users(),

        selectedGroup: undefined,

        events: {
            "click #create_group_button" : "createGroup",
            "click #delete_group_button" : "deleteGroup",
            'click #group_users_table tr': 'selectGroup'
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
                groupsView.render();
            });
            this.selectedGroup = undefined;
            this.groups = this.rootView.groups;
            this.render();
        },

        render: function () {
            this.disableSelectionRequiredButtons(true);
            $("#group_users_table").dataTable().fnClearTable();
            
            var groupListView = this;
            this.groups.fetch({
                reset: true,
                success: function(){
                    groupListView.addAllGroups();
                }
            });
        },
        
        selectGroup: function(event){
            $("#group_users_table tr").removeClass('row_selected');
            $(event.currentTarget).addClass('row_selected');
            
            var rowData = $("#group_users_table").dataTable().fnGetData(event.currentTarget);
            this.selectedGroup = this.groups.get($.parseHTML(rowData[0])[0]);
            
            if(this.selectedGroup) {
                this.disableSelectionRequiredButtons(false);
            }
        },
        
        addAllGroups: function() {
            $("#group_users_table").dataTable().fnClearTable();
            $.each(this.groups.models, function(index, value) {
                var rowData = ['<a href="#account/management/groups" id="'+value.attributes.id+'" class="group_item">'+value.attributes.name+"</a>", value.attributes.description];
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
                $("#create_group_button").removeAttr("disabled");
                $("#create_group_button").removeClass("ui-state-disabled");
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
                    $("#create_group_button").attr("disabled", true);
                    $("#create_group_button").addClass("ui-state-disabled");
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

        clearSelection: function() {
            this.selectedGroup = undefined;
            $(".group_item").removeClass("selected_item");
        },

        close: function(){
            this.$el.remove();
        }  
    });

    return GroupsManagementListView;
});