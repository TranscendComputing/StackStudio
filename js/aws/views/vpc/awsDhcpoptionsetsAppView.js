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
        'text!templates/aws/vpc/awsDhcpOptionsSetAppTemplate.html',
        '/js/aws/models/vpc/awsDhcpOptionsSet.js',
        '/js/aws/collections/vpc/awsDhcpOptionsSets.js',
        '/js/aws/views/vpc/awsDhcpOptionsSetCreateView.js',
        'icanhaz',
        'common',
        'jquery.dataTables'
], function( $, _, Backbone, AppView, awsDhcpOptionsSetAppTemplate, DhcpOptionsSet, DhcpOptionsSets, AwsDhcpOptionsSetCreateView, ich, Common ) {
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
	var AwsDhcpOptionsSetsAppView = AppView.extend({
	    template: _.template(awsDhcpOptionsSetAppTemplate),
	    
        modelStringIdentifier: "id",
                
        model: DhcpOptionsSet,
        
        idColumnNumber: 0,
        
        columns: ["id", "dhcp_configuration_set"],
        
        collectionType: DhcpOptionsSets,
        
        type: "vpc",
        
        subtype: "dhcpoptionsets",
        
        CreateView: AwsDhcpOptionsSetCreateView,
                
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
            
            var dhcpOptionsApp = this;
            Common.vent.on("dhcpOptionAppRefresh", function() {
                dhcpOptionsApp.render();
            });
        },
        
        toggleActions: function(e) {
            //Disable any needed actions
        },
        
        performAction: function(event) {
            var dhcpOption = this.collection.get(this.selectedId);
            
            switch(event.target.text)
            {
            case "Delete":
                dhcpOption.destroy(this.credentialId, this.region);
                break;
            }
        },
	});
    
	return AwsDhcpOptionsSetsAppView;
});
