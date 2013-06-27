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
        '/js/openstack/views/identity/openstackTenantAddUsersView.js',
        '/js/openstack/views/identity/openstackTenantEditUserView.js',
        'icanhaz',
        'common',
        'messenger',
        'dataTables.fnReloadAjax'
], function( $, _, Backbone, AppView, openstackTenantAppTemplate, Tenant, Tenants, Users, OpenstackTenantCreateView, AddUsersView, EditUserView, ich, Common, Messenger ) {
	'use strict';

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
            'click a#users': 'refreshUsersTab',
            'click button#users_add_button': 'addUsers',
            'click a.remove_user': 'removeUser'
        },

        initialize: function(options) {
            if(options.cred_id) {
                this.credentialId = options.cred_id;
            }
            if(options.region) {
                this.region = options.region;
            }
            this.render();
            
            var tenantApp = this;
            Common.vent.on("tenant:usersUpdated", this.refreshUsers, this);
            Common.vent.on("tenantAppRefresh", function() {
                tenantApp.render();
            });
        },
        
        toggleActions: function(e) {
            //Disable any needed actions
        },

        refreshUsersTab: function() {
            $("#users_tab").empty();
            $("#users_tab").append("<button id='users_add_button'>Add Users</button><br /><br />" +
                                    "<table id='users_table' class='full_width'>" +
                                        "<thead>" +
                                            "<tr>" +
                                                "<th>ID</th><th>Name</th><th>Email</th><th>Enabled</th><th>Actions</th>" +
                                            "</tr>" +
                                        "</thead>" +
                                        "<tbody></tbody><tfoot></tfoot>" +
                                    "</table>");
            $("#users_table").dataTable({
                "bJQueryUI": true,
                "sDom": 't'
            });
            $("#users_add_button").button();
            this.refreshUsers();
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

        refreshUsers: function() {
            this.users = new Users();
            this.users.on( 'reset', this.addAllUsers, this );
            this.users.fetch({data: {tenant_id: this.selectedId, cred_id: this.credentialId, region: this.region}, reset: true});
        },

        addAllUsers: function() {
            var view = this;
            $("#users_table").dataTable().fnClearTable();
            this.users.each(function(user) {
                $("#users_table").dataTable().fnAddData([
                    '<a href="#resources/openstack/' +  view.region + '/identity/users/' + user.attributes.id + '">' + user.attributes.id + '</a>',
                    user.attributes.name,
                    user.attributes.email,
                    user.attributes.enabled,
                    "<a id="+user.attributes.id+" class='remove_user' href=''>Remove</a>"
                ]);
            });
        },

        addUsers: function() {
            var tenant = this.collection.get(this.selectedId);
            tenant.set({users: this.users});
            var addUsersView = new AddUsersView({credentialId: this.credentialId, region: this.region, model: tenant});
        },

        removeUser: function(e) {
            var tenant = this.collection.get(this.selectedId);
            var user = this.users.get(e.target.id);
            tenant.removeUser(user, this.credentialId, this.region);
            return false;
        },
	});
    
	return OpenstackTenantsAppView;
});
