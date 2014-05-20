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
        'text!templates/openstack/network/openstackSubnetAppTemplate.html',
        'openstack/models/network/openstackSubnet',
        'openstack/collections/network/openstackSubnets',
        'openstack/views/network/openstackSubnetCreateView',
        'icanhaz',
        'common'
], function( $, _, Backbone, AppView, openstackSubnetAppTemplate, Subnet, Subnets, OpenstackSubnetCreateView, ich, Common ) {
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
	var OpenstackSubnetsAppView = AppView.extend({
	    template: _.template(openstackSubnetAppTemplate),
	    
        modelStringIdentifier: "id",
        
        columns: ["name", "id", "ip_version", "cidr"],
        
        idColumnNumber: 1,
        
        model: Subnet,
        
        collectionType: Subnets,
        
        type: "network",
        
        subtype: "subnets",
        
        CreateView: OpenstackSubnetCreateView,
        
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
            
            var subnetApp = this;
            Common.vent.on("subnetAppRefresh", function() {
                subnetApp.render();
            });
        },
        
        toggleActions: function(e) {
            //Disable any needed actions
        },
        
        performAction: function(event) {
            var subnet = this.collection.get(this.selectedId);
            
            switch(event.target.text)
            {
            case "Delete Subnet":
                subnet.destroy(this.credentialId);
                break;
            }
        }
	});
    
	return OpenstackSubnetsAppView;
});
