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
        'text!templates/openstack/identity/openstackTenantAppTemplate.html',
        '/js/openstack/models/identity/openstackTenant.js',
        '/js/openstack/collections/identity/openstackTenants.js',
        '/js/openstack/collections/identity/openstackUsers.js',
        '/js/openstack/views/identity/openstackTenantCreateView.js',
        'icanhaz',
        'common',
        'dataTables.fnReloadAjax'
], function( $, _, Backbone, AppView, openstackTenantAppTemplate, Tenant, Tenants, Users, OpenstackTenantCreateView, ich, Common ) {
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
            'click #user_action_menu ul li': 'performUserAction'
        },

        initialize: function(options) {
            if(options.cred_id) {
                this.credentialId = options.cred_id;
            }
            this.render();
            
            var tenantApp = this;
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
            $("#user_action_menu li").addClass("ui-state-disabled");
            this.$usersTable = $('#users_table').dataTable({
                "bJQueryUI": true,
                "sDom": "ipt",
                "aoColumns": [
                    {"sTitle": "ID", "mDataProp": "id"},
                    {"sTitle": "Name", "mDataProp": "name"},
                    {"sTitle": "Email", "mDataProp": "email"},
                    {"sTitle": "Enabled", "mDataProp": "enabled"}
                ],
                sDefaultContent: "",
                sAjaxDataProp: "",
                fnServerData: function(sSource, aoData, fnCallback) {
                    $("#user_action_menu li").addClass("ui-state-disabled");
                    var users = view.users.toJSON(),
                        id;
                    _.each(users, function(u){
                        var id = u.id;
                        u.id = '<a href="#resources/openstack/undefined/identity/users/' + id + '">' + id + '</a>';
                    });
                    fnCallback(users);
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
            this.$userTable.$('tr').removeClass('row_selected');
            $(event.currentTarget).addClass('row_selected');
            var userData = this.$userTable.fnGetData(event.currentTarget);
            this.selectedUser = this.users.get(userData.id);
            if(this.selectedUser) {
                $("#user_action_menu li").removeClass("ui-state-disabled");
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
        }
	});
    
	return OpenstackTenantsAppView;
});
