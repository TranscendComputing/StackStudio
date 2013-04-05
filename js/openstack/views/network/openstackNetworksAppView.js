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
        'text!templates/openstack/network/openstackNetworkAppTemplate.html',
        '/js/openstack/models/network/openstackNetwork.js',
        '/js/openstack/collections/network/openstackNetworks.js',
        '/js/openstack/views/network/openstackNetworkCreateView.js',
        'icanhaz',
        'common'
], function( $, _, Backbone, AppView, openstackNetworkAppTemplate, Network, Networks, OpenstackNetworkCreateView, ich, Common ) {
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
	var OpenstackNetworksAppView = AppView.extend({
	    template: _.template(openstackNetworkAppTemplate),
	    
        modelStringIdentifier: "id",
        
        columns: ["name", "id", "provider:physical_network", "status"],
        
        idColumnNumber: 1,
        
        model: Network,
        
        collectionType: Networks,
        
        type: "network",
        
        subtype: "networks",
        
        CreateView: OpenstackNetworkCreateView,
        
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
            
            var networkApp = this;
            Common.vent.on("networkAppRefresh", function() {
                networkApp.render();
            });
        },
        
        toggleActions: function(e) {
            //Disable any needed actions
        },
        
        performAction: function(event) {
            var network = this.collection.get(this.selectedId);
            
            switch(event.target.text)
            {
            case "Delete Network":
                network.destroy(this.credentialId);
                break;
            }
        }
	});
    
	return OpenstackNetworksAppView;
});
