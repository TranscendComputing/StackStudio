/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true alert:true */
define([
        'jquery',
        'underscore',
        'backbone',
        'views/resource/resourceAppView',
        'text!templates/openstack/identity/openstackTenantAppTemplate.html',
        '/js/openstack/models/identity/openstackTenant.js',
        '/js/openstack/collections/identity/openstackTenants.js',
        '/js/openstack/collections/identity/openstackUsers.js',
        '/js/openstack/views/identity/openstackTenantCreateView.js',
        '/js/openstack/views/identity/openstackTenantConfirmRemoveView.js',
        '/js/openstack/views/identity/openstackTenantAddUsersView.js',
        '/js/openstack/views/identity/openstackTenantEditUserView.js',
        'icanhaz',
        'common',
        'messenger',
        'dataTables.fnReloadAjax'
], function( $, _, Backbone, AppView, openstackTenantAppTemplate, Tenant, Tenants, Users, OpenstackTenantCreateView, ConfirmDialog, AddUsersView, EditUserView, ich, Common, Messenger ) {
	'use strict';

	// Openstack Application View
	// ------------------------------

    /**
     * Openstack AppView is UI view list of cloud items.
     *
     * @name AppView
     * @constructor
     * @category Resources
     * @param {Object} initialization object.
     * @returns {Object} Returns an OpenstackAppView instance.
     */
	var OpenstackTenantsAppView = AppView.extend({
	    template: _.template(openstackTenantAppTemplate),
	    
        modelStringIdentifier: "id",
        
        columns: ["id", "name", "description", "enabled"],
        
        idColumnNumber: 0,
        
        model: Tenant,
        
        collectionType: Tenants,
        
        type: "identity",
        
        subtype: "tenants",
        
        CreateView: OpenstackTenantCreateView,
        
        events: {
            'click .create_button': 'createNew',
            'click #action_menu ul li': 'performAction',
            'click #resource_table tr': "clickOne",
            'click #users_refresh_button': 'fetchUsers',
            'click #users_table tr': 'toggleUserActions',
            'click #user_action_menu ul li': 'performUserAction',
            'click input.remove-all': 'toggleRemoveAll',
            'click input.remove-one': 'toggleRemoveOne',
            'click a#users_table_next': 'renderNextPage',
            'click button.remove': 'confirmRemove',
            'click a.remove-one': 'confirmRemove',
            'click a.edit-one': 'editUserRoles',
            'click button#users_add_button': 'addUsers'
        },

        initialize: function(options) {
            if(options.cred_id) {
                this.credentialId = options.cred_id;
            }
            this.render();
            
            var tenantApp = this;
            Common.vent.on("tenant:usersUpdated", this.fetchUsers, this);
            Common.vent.on("tenantAppRefresh", function() {
                tenantApp.render();
            });
        },
        
        toggleActions: function(e) {
            this.renderUsersTable();
            this.users = new Users();
            this.users.on("reset", this.refreshTable, this);
            this.users.on("add", this.refreshTable, this);
            this.users.on("destroy", this.refreshTable, this);
            this.users.fetch({data: {tenant_id: this.selectedId, cred_id: this.credentialId, region: this.region}, reset: true});
            //Disable any needed actions
        },

        renderUsersTable: function() {
            var view = this;
            this.$("button").button();
            this.$("#user_action_menu").menu();
            this.$("button.remove").button("option", "disabled", true);
            this.$usersTable = $('#users_table').dataTable({
                "bJQueryUI": true,
                "sDom": "ipt",
                "aoColumns": [
                    {"sTitle": "<input type='checkbox' class='remove-all'></input>", "mDataProp": "remove"},                
                    {"sTitle": "ID", "mDataProp": "idLink"},
                    {"sTitle": "Name", "mDataProp": "name"},
                    {"sTitle": "Email", "mDataProp": "email"},
                    {"sTitle": "Enabled", "mDataProp": "enabled"},
                    {"sTitle": "Actions", "mDataProp": "action"}
                ],
                sDefaultContent: "",
                sAjaxDataProp: "",
                fnServerData: function(sSource, aoData, fnCallback) {
                    view.$("button.remove").button("option", "disabled", true);
                    var users = view.users.toJSON(),
                        id;
                    _.each(users, function(u){
                        var id = u.id;
                        // Add link to users table
                        u.idLink = '<a href="#resources/openstack/' +  view.region + '/identity/users/' + id + '">' + id + '</a>';
                        // Add remove checkbox
                        u.remove = '<input type="checkbox" class="remove-one"></input>';
                        u.action = "<a class='remove-one table-action' href=''>Remove</a>/<a class='edit-one table-action' href=''>Edit Roles</a>";
                    });
                    fnCallback(users);
                    view.$("button.remove-one").button();
                }
            }, view);
        },
        
        performAction: function(event) {
            var tenant = this.collection.get(this.selectedId);
            
            switch(event.target.text)
            {
            case "Delete Tenant":
                tenant.destroy(this.credentialId);
                break;
            }
        },

        fetchUsers: function() {
            this.users.fetch({data: {tenant_id: this.selectedId, cred_id: this.credentialId, region: this.region}, reset: true});
        },
        
        refreshTable: function() {
            this.$usersTable.fnClearTable();
            this.$usersTable.fnReloadAjax();
        },

        toggleUserActions: function(e) {
            this.selectUser(e);
            //Disable any needed actions
        },
        
        selectUser: function (event) {
            var userData = this.$usersTable.fnGetData(event.currentTarget);
            if(userData)
            {
                this.selectedUser = this.users.get(userData.id);
            }else{
                this.selectedUser = undefined;
            }
        },
        
        performUserAction: function(event) {
            if(this.selectedUser) {
                switch(event.target.text)
                {
                case "Add User":
                    // TODO: Prompt add user dialog
                    break;
                case "Remove User":
                    // TODO: Remove user
                    break;
                }
            }
        },

        /**
         *    Checkbox toggle listener for all rows that determines whether to enable or
         *    disable to Remove Users button as well as checking/unchecking all rows in table
         *    @author Curtis   Stewart
         *    @param  {MouseEvent} event   handler for input.remove-all click
         */
        toggleRemoveAll: function(event) {
            var checked = $(event.currentTarget).is(":checked"),
                nodes = this.$usersTable.fnGetNodes(),
                input;
            _.each(nodes, function(node) {
                input = $(node).find("input");
                $(input).prop('checked', checked);
            });
            this.$("button.remove").button("option", "disabled", !checked);
            this.selectedUser = undefined;
        },

        /**
         *    Checkbox toggle listener for single row that determines whether to enable or
         *    disable the Remove Users button as well as to determine if 'checkall' box should
         *    be checked.
         *    @author Curtis   Stewart
         *    @param  {MouseEvent} event   handler for input.remove-one click
         */
        toggleRemoveOne: function(event) {
            var checked = false,
                nodes = this.$usersTable.fnGetNodes(),
                input;
            _.each(nodes, function(node) {
                input = $(node).find("input");
                if($(input).is(":checked"))
                {
                    checked = true;
                }
            });
            this.$("button.remove").button("option", "disabled", !checked);
            // Check if all rows are checked or not, then check/uncheck 'remove-all' checkbox
            var allChecked = this.$("input.remove-one:checked").length === this.$("input.remove-one").length;
            $("input.remove-all").prop('checked', allChecked);
        },

        /**
         *    Only first page is completely rendered initially.  This
         *    handler takes care of rendering all other pages by listening
         *    to click of '<table>_next_page' anchor'
         *    @author Curtis   Stewart
         */
        renderNextPage: function() {
            this.$("button.remove-one").button();
        },

        confirmRemove: function(event) {
            var removing = this.$usersTable.fnGetData(event.currentTarget.parentElement.parentElement);
            if(removing)
            {
                this.selectedUser = this.users.get(removing.id);
            }else{
                this.selectedUser = undefined;
            }
            var confirmDialog = new ConfirmDialog({
                message: "Please confirm your selection. This action cannot be undone."
            });
            Common.vent.on("tenant:confirmRemove", this.removeUsers, this);
            return false;
        },

        removeUsers: function() {
            var view = this;
            var tenant = this.collection.get(this.selectedId);
            if(view.selectedUser)
            {
                tenant.removeUser(view.selectedUser, "tenant:usersUpdated", this.credentialId, this.region);
            }else{
                var selectedUsers = [],
                    user,
                    rows = view.$usersTable.fnGetNodes(),
                    rowData;
                // Iterate through each row, if checked, add to selected users array
                _.each(rows, function(row){
                    if($(row).find("input:checked").length > 0)
                    {
                        rowData = view.$usersTable.fnGetData(row);
                        user = view.users.get(rowData.id);
                        selectedUsers.push(user);
                    }
                }, view);
            }
        },

        addUsers: function() {
            var tenant = this.collection.get(this.selectedId);
            tenant.set({users: this.users});
            var addUsersView = new AddUsersView({credentialId: this.credentialId, region: this.region, model: tenant});
        },

        editUserRoles: function(event) {
            var tenant = this.collection.get(this.selectedId);
            var userRow = this.$usersTable.fnGetData(event.currentTarget.parentElement.parentElement);
            if(userRow)
            {
                this.selectedUser = this.users.get(userRow.id);
            }
            var editUserView = new EditUserView({credentialId: this.credentialId, region: this.region, model: this.selectedUser, tenant: tenant});
            return false;
        }
	});
    
	return OpenstackTenantsAppView;
});
