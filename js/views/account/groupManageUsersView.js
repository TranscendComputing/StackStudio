/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true alert:true*/
define([
        'jquery',
        'underscore',
        'backbone',
        'views/dialogView',
        'text!templates/account/groupManageUsersTemplate.html',
        '/js/models/group.js',
        'common'
], function( $, _, Backbone, DialogView, groupManageUsersTemplate, Group, Common ) {

    var GroupManageUsersView = DialogView.extend({

        groupId: undefined,

        group: undefined,

        org: undefined,

        selectedGroupUserId: undefined,

        selectedNonGroupUserId: undefined,

        events: {
            "dialogclose": "close",
            "click .group_user": "selectGroupUser",
            "click .non_group_user": "selectNonGroupUser",
            "click #add_user_button": "addUser",
            "click #remove_user_button": "removeUser"
        },

        initialize: function(options) {
            this.groupId = options.group_id;
            var view = this;
            var compiledTemplate = _.template(groupManageUsersTemplate);
            this.$el.html(compiledTemplate);

            this.$el.dialog({
                autoOpen: true,
                title: "Manage Group Users",
                resizable: false,
                width: 500,
                modal: true,
                buttons: {
                    Close: function() {
                        view.save();
                    }
                }
            });
            $("button").button();
            Common.vent.off("groupUserRefresh");
            Common.vent.on("groupUserRefresh", function() {
                view.render();
            });
            this.render();
        },

        render: function() {
            var view = this;
            //call to get updated org
            if(sessionStorage) {
               $.ajax({
                    url: Common.apiUrl + "/identity/v1/orgs/" + sessionStorage.org_id + ".json",
                    type: 'GET',
                    contentType: 'application/x-www-form-urlencoded',
                    success: function(data) {
                        view.org = data.org;
                        view.refresh();
                    },
                    error: function(jqXHR) {
                        Common.errorDialog(jqXHR.statusText, jqXHR.responseText);
                    }
                });
            }
        },

        refresh: function() {
            var view = this;
            var accounts = this.org.accounts;
            //refresh group
            this.group = undefined;
            $.each(this.org.groups, function(index, value) {
                if(view.groupId === value.group.id) {
                    view.group = new Group(value.group);
                }
            });
            $("#non_group_users_menu_list").empty();
            $("#group_users_menu_list").empty();
            $.each(accounts, function(index, value) {
                if(view.group.hasUser(value.account.id)) {
                    $("#group_users_menu_list").append("<li id=" + value.account.id + " class='group_user'>" + value.account.login + "</li>");
                }else {
                    $("#non_group_users_menu_list").append("<li id=" + value.account.id + " class='non_group_user'>" + value.account.login + "</li>");
                }
            });
        },

        selectGroupUser: function(event) {
            this.clearGroupUserSelection();
            $(event.target).addClass("selected_item");
            this.selectedGroupUserId = event.target.id;
        },

        selectNonGroupUser: function(event) {
            this.clearNonGroupUserSelection();
            $(event.target).addClass("selected_item");
            this.selectedNonGroupUserId = event.target.id;
        },

        clearGroupUserSelection: function() {
            $(".group_user").removeClass("selected_item");
            this.selectedGroupUserId = undefined;
        },

        clearNonGroupUserSelection: function() {
            $(".non_group_user").removeClass("selected_item");
            this.selectedNonGroupUserId = undefined;
        },

        addUser: function() {
            if(this.group) {
                this.group.addUser(this.selectedNonGroupUserId);
            }
        },

        removeUser: function() {
            if(this.group) {
                this.group.removeUser(this.selectedGroupUserId);
            }
        },

        save: function() {
            Common.vent.trigger("groupRefresh");
            this.$el.dialog('close');
        }
    });

    return GroupManageUsersView;
});
