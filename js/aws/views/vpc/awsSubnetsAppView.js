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
        'views/resourceAppView',
        'text!templates/aws/vpc/awsSubnetAppTemplate.html',
        '/js/aws/models/vpc/awsSubnet.js',
        '/js/aws/collections/vpc/awsSubnets.js',
        '/js/aws/views/vpc/awsSubnetCreateView.js',
        'icanhaz',
        'common',
        'jquery.dataTables'
], function( $, _, Backbone, AppView, awsSubnetAppTemplate, Subnet, Subnets, AwsSubnetCreateView, ich, Common ) {
	'use strict';

	// Aws Application View
	// ------------------------------

    /**
     * Aws AppView is UI view list of cloud items.
     *
     * @name AppView
     * @constructor
     * @category Resources
     * @param {Object} initialization object.
     * @returns {Object} Returns an AwsAppView instance.
     */
	var AwsSubnetsAppView = AppView.extend({
	    template: _.template(awsSubnetAppTemplate),
	    
        modelStringIdentifier: "subnet_id",
                
        model: Subnet,
        
        idColumnNumber: 0,
        
        columns: ["subnet_id", "state", "vpc_id","cidr_block","available_ip_address_count","availability_zone"],
        
        collectionType: Subnets,
        
        type: "vpc",
        
        subtype: "subnets",
        
        CreateView: AwsSubnetCreateView,
                
        events: {
            'click .create_button': 'createNew',
            'click #action_menu ul li': 'performAction',
            'click #resource_table tr': "clickOne"
        },

        initialize: function(options) {
            if(options.cred_id) {
                this.credentialId = options.cred_id;
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
            case "Delete":
                subnet.destroy(this.credentialId);
                break;
            }
        }
	});
    
	return AwsSubnetsAppView;
});
