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
        'common',
        'icanhaz',
        'views/dialogView',
        'text!templates/openstack/identity/openstackTenantAddUsersTemplate.html',
        '/js/openstack/collections/identity/openstackRoles.js',
        '/js/openstack/collections/identity/openstackUsers.js',
        'jquery.multiselect',
        'jquery.multiselect.filter',
        'dataTables.fnReloadAjax'
], function( $, _, Backbone, Common, ich, DialogView, tenantAddUsersTemplate, Roles, Users ) {

    var TenantConfirmRemoveView = DialogView.extend({
        template: _.template(tenantAddUsersTemplate),

        events: {
            "dialogclose": "close",
            "click a.add-link": "addUser",
            "click a.remove-link": "removeUser",
            "multiselectclose select.default-roles": "setDefaultRoles",
            "multiselectclose select.user-roles": "setUserRoles"
        },

        initialize: function(options) {
            this.credentialId = options.credentialId;
            this.region = options.region;
            this.roles = new Roles();
            this.currentUsers = new Users();
            this.newUsers = new Users();
            this.render();
            this.newUsers.on("add", this.refreshNewUsersTable, this);
            this.newUsers.on("remove", this.refreshNewUsersTable, this);
            this.newUsers.on("reset", this.refreshNewUsersTable, this);
            this.currentUsers.on("reset", this.refreshUsersTable, this);
            this.currentUsers.on("remove", this.refreshUsersTable, this);
            this.currentUsers.on("add", this.refreshUsersTable, this);
            this.currentUsers.fetch({data: {cred_id: this.credentialId, region: this.region}, reset: true});
            this.roles.on("reset", this.renderDefaultRoles, this);
            this.roles.fetch({data: {cred_id: this.credentialId, region: this.region}, reset: true});
        },
        
        render: function() {
            var createView = this;
            this.$el.html( this.template() );
            this.$el.dialog({
                autoOpen: true,
                title: "Add Users",
                width:750,
                minHeight: 575,
                resizable: false,
                modal: true,
                buttons: {
                    Submit: function () {
                        createView.submit();
                    },
                    Cancel: function() {
                        createView.cancel();
                    }
                }
            });

            ich.refresh();
            this.renderAddedTable();
            this.renderAllTable();
        },

        renderAllTable: function() {
            var view = this;
            this.$allTable = $('#all_users_table').dataTable({
                "bJQueryUI": true,
                "bDestroy": true,
                "aoColumns": [
                    {"sTitle": "Name", "mDataProp": "name"},
                    {"sTitle": "Email", "mDataProp": "email"},
                    {"sTitle": "Enabled", "mDataProp": "enabled"},
                    {"sTitle": "Action", "mDataProp": "action"}
                ],
                sDefaultContent: "",
                sAjaxDataProp: "",
                fnServerData: function(sSource, aoData, fnCallback) {
                    var users = view.currentUsers.without(view.model.get("users")).toJSON();
                    _.each(users, function(u){
                        // Add roles checkbox
                        u.action = "<a class='add-link' href=''>Add</a>";
                    });
                    fnCallback(users);
                }
            }, view);
        },

        renderAddedTable: function() {
            var view = this;
            this.$addedTable = $('#added_users_table').dataTable({
                "bJQueryUI": true,
                "bDestroy": true,
                "bSort": false,
                "sDom": "ipt",
                "aoColumns": [
                    {"sTitle": "Name", "mDataProp": "name"},
                    {"sTitle": "Email", "mDataProp": "email"},
                    {"sTitle": "Enabled", "mDataProp": "enabled"},
                    {"sTitle": "Roles", "mDataProp": "rolesList"},
                    {"sTitle": "Action", "mDataProp": "action"}
                ],
                sDefaultContent: "",
                sAjaxDataProp: "",
                fnServerData: function(sSource, aoData, fnCallback) {
                    var users = view.newUsers.toJSON();
                    _.each(users, function(u){
                        // Add roles checkbox
                        u.rolesList = ich.role_select({roles: view.roles.without(u.roles).toJSON(), userRoles: u.roles.toJSON()}, true);
                        // Add remove button
                        u.action = "<a class='remove-link' href>Remove</a>";
                    });
                    fnCallback(users);
                    view.$("select.user-roles").multiselect({
                        selectedList: 2,
                        noneSelectedText: "Select Roles"
                    });
                }
            }, view);
        },

        renderDefaultRoles: function() {
            this.$("#default_roles").append(ich.default_roles_select({roles: this.roles.toJSON()}));
            this.$defaultRoles = $("select.default-roles").multiselect({
                selectedList: 2,
                noneSelectedText: "Select Roles"
            });
            this.selectedRoles = new Roles();
        },

        refreshUsersTable: function() {
            this.$allTable.fnClearTable();
            this.$allTable.fnReloadAjax();
        },

        refreshNewUsersTable: function() {
            this.$addedTable.fnClearTable();
            this.$addedTable.fnReloadAjax();
        },

        addUser: function(event) {
            var rowData = this.$allTable.fnGetData(event.currentTarget.parentElement.parentElement);
            var user = this.currentUsers.get(rowData.id);
            if(!user.has("roles"))
            {  
                user.set({roles: this.selectedRoles});
            }
            this.currentUsers.remove(user);
            this.newUsers.add(user);
            return false;
        },

        removeUser: function(event) {
            var rowData = this.$addedTable.fnGetData(event.currentTarget.parentElement.parentElement);
            var user = this.newUsers.get(rowData.id);
            user.unset("roles");
            this.newUsers.remove(user);
            this.currentUsers.add(user);
            return false;
        },

        setDefaultRoles: function(event) {
            var view = this,
                role;
            view.selectedRoles.reset();
            var rolesList = this.$defaultRoles.multiselect("getChecked");
            _.each(rolesList, function(roleItem) {
                role = view.roles.get( $(roleItem).val() );
                view.selectedRoles.add(role);
            }, view);
        },

        setUserRoles: function(event) {
            var view = this,
                rowData = this.$addedTable.fnGetData(event.currentTarget.parentElement.parentElement),
                user = this.newUsers.get(rowData.id),
                selectedRoles = $(event.currentTarget).multiselect("getChecked"),
                userRoles = user.get("roles"),
                role;
            userRoles.reset();
            _.each(selectedRoles, function(roleItem) {
                role = view.roles.get( $(roleItem).val() );
                userRoles.add(role);
            }, view);
            user.set({roles: userRoles});
        },

        submit: function() {
            var view = this;
            var roles;
            view.newUsers.each(function(user) {
                roles = user.get("roles");
                roles.each(function(role) {
                    view.model.addUser(user, role, view.credentialId, view.region);
                });
            });
            this.$el.dialog("close");
        }

    });
    
    return TenantConfirmRemoveView;
});
