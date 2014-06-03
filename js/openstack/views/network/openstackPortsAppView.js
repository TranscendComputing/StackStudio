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
        'text!templates/openstack/network/openstackPortAppTemplate.html',
        'openstack/models/network/openstackPort',
        'openstack/collections/network/openstackPorts',
        'openstack/views/network/openstackPortCreateView',
        'icanhaz',
        'common'
], function( $, _, Backbone, AppView, openstackPortAppTemplate, Port, Ports, OpenstackPortCreateView, ich, Common ) {
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
	var OpenstackPortsAppView = AppView.extend({
	    template: _.template(openstackPortAppTemplate),
	    
        modelStringIdentifier: "id",
        
        columns: ["name", "id", "mac_address", "status"],
        
        idColumnNumber: 1,
        
        model: Port,
        
        collectionType: Ports,
        
        type: "network",
        
        subtype: "ports",
        
        CreateView: OpenstackPortCreateView,
        
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
            
            var portApp = this;
            Common.vent.on("portAppRefresh", function() {
                portApp.render();
            });
        },
        
        toggleActions: function(e) {
            //Disable any needed actions
        },
        
        performAction: function(event) {
            var port = this.collection.get(this.selectedId);
            
            switch(event.target.text)
            {
            case "Delete Port":
                port.destroy(this.credentialId);
                break;
            }
        }
	});
    
	return OpenstackPortsAppView;
});
