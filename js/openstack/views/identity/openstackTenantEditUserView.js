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
        'text!templates/openstack/identity/openstackTenantEditUserTemplate.html',
        '/js/openstack/collections/identity/openstackRoles.js',
        'jquery.ui.selectmenu',
        'jquery.multiselect'
], function( $, _, Backbone, Common, ich, DialogView, tenantEditUserTemplate, Roles ) {

    var TenantConfirmRemoveView = DialogView.extend({
        template: _.template(tenantEditUserTemplate),

        events: {
            "dialogclose": "close",
            "multiselectclose": "setUserRoles"
        },

        initialize: function(options) {
            ich.refresh();
            this.credentialId = options.credentialId;
            this.region = options.region;
            this.tenant = options.tenant;
            this.addRoles = new Roles();
            this.removeRoles = new Roles();
            this.model.once("user:listRoles", this.render, this);
            this.model.getRoles(this.tenant.id, this.credentialId, this.region);
        },
        
        render: function() {
            var createView = this;
            createView.$el.html(this.template);
            createView.$el.dialog({
                autoOpen: true,
                title: "Edit User Roles",
                width:500,
                minHeight: 200,
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
            ich.grabTemplates();
            createView.$("#default_roles").html( ich.roles_list_template({
                name: createView.model.get("name"),
                roles: createView.model.get("roles").toJSON(),
                availableRoles: createView.model.get("availableRoles").toJSON()
            }) );
            createView.$rolesList = createView.$("select.multiselect").multiselect({
                        selectedList: 5,
                        noneSelectedText: "Select Roles"
            });
        },

        setUserRoles: function(event) {
            var view = this,
                selectedRoles = view.$rolesList.multiselect("getChecked"),
                unselectedRoles = view.$rolesList.multiselect("getUnchecked"),
                currentRoles = view.model.get("roles"),
                availableRoles = view.model.get("availableRoles"),
                role, updatedRole;
            _.each(selectedRoles, function(roleItem) {
                role = availableRoles.get( $(roleItem).val() );
                if(role)
                {
                    view.addRoles.add(role);
                }
                updatedRole = view.removeRoles.get( $(roleItem).val() );
                if(updatedRole)
                {
                    view.removeRoles.remove(updatedRole);
                }
            }, view);
            _.each(unselectedRoles, function(roleItem) {
                role = currentRoles.get( $(roleItem).val() );
                if(role)
                {
                    view.removeRoles.add(role);
                }
                updatedRole = view.addRoles.get( $(roleItem).val() );
                if(updatedRole)
                {
                    view.addRoles.remove(updatedRole);
                }
            }, view);
            view.$("#overview").html(ich.overview_template({
                rolesAdded: (view.addRoles.length > 0),
                addedRoles: view.addRoles.toJSON(),
                rolesRemoved: (view.removeRoles.length > 0),
                removedRoles: view.removeRoles.toJSON()
            }));
        },

        submit: function() {
            var view = this;
            view.addRoles.each(function(role) {
                view.tenant.addUser(view.model, role, "tenant:usersUpdated", view.credentialId, view.region);
            });
            view.removeRoles.each(function(role) {
                view.tenant.removeUser(view.model, role, "tenant:usersUpdated", view.credentialId, view.region);
            });
            this.$el.dialog("close");
        }

    });
    
    return TenantConfirmRemoveView;
});
