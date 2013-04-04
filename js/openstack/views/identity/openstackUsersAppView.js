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
        'text!templates/openstack/identity/openstackUserAppTemplate.html',
        '/js/openstack/models/identity/openstackUser.js',
        '/js/openstack/collections/identity/openstackUsers.js',
        '/js/openstack/views/identity/openstackUserCreateView.js',
        'icanhaz',
        'common'
], function( $, _, Backbone, AppView, openstackUserAppTemplate, User, Users, OpenstackUserCreateView, ich, Common ) {
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
	var OpenstackUsersAppView = AppView.extend({
	    template: _.template(openstackUserAppTemplate),
	    
        modelStringIdentifier: "id",
        
        columns: ["name", "id", "email", "enabled"],
        
        idColumnNumber: 1,
        
        model: User,
        
        collectionType: Users,
        
        type: "identity",
        
        subtype: "users",
        
        CreateView: OpenstackUserCreateView,
        
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
            
            var userApp = this;
            Common.vent.on("userAppRefresh", function() {
                userApp.render();
            });
        },
        
        toggleActions: function(e) {
            //Disable any needed actions
        },
        
        performAction: function(event) {
            var user = this.collection.get(this.selectedId);
            
            switch(event.target.text)
            {
            case "Delete User":
                user.destroy(this.credentialId);
                break;
            }
        }
	});
    
	return OpenstackUsersAppView;
});
