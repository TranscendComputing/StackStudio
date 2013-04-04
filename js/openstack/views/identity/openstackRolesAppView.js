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
        'text!templates/openstack/identity/openstackRoleAppTemplate.html',
        '/js/openstack/models/identity/openstackRole.js',
        '/js/openstack/collections/identity/openstackRoles.js',
        '/js/openstack/views/identity/openstackRoleCreateView.js',
        'icanhaz',
        'common'
], function( $, _, Backbone, AppView, openstackRoleAppTemplate, Role, Roles, OpenstackRoleCreateView, ich, Common ) {
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
	var OpenstackRolesAppView = AppView.extend({
	    template: _.template(openstackRoleAppTemplate),
	    
        modelStringIdentifier: "id",
        
        columns: ["id", "name"],
        
        idColumnNumber: 0,
        
        model: Role,
        
        collectionType: Roles,
        
        type: "identity",
        
        subtype: "roles",
        
        CreateView: OpenstackRoleCreateView,
        
        events: {
            'click .create_button': 'createNew',
            'click #action_menu ul li': 'performAction',
            'click #resource_table tr': "clickOne"
        },

        initialize: function(options) {
            if(options.cred_id) {
                this.credentialId = options.cred_id;
            }
            if(options.region) {
                this.region = options.region;
            }
            this.render();
            
            var roleApp = this;
            Common.vent.on("roleAppRefresh", function() {
                roleApp.render();
            });
        },
        
        toggleActions: function(e) {
            //Disable any needed actions
        },
        
        performAction: function(event) {
            var role = this.collection.get(this.selectedId);
            
            switch(event.target.text)
            {
            case "Delete Role":
                role.destroy(this.credentialId);
                break;
            }
        }
	});
    
	return OpenstackRolesAppView;
});
