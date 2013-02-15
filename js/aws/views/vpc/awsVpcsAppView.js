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
        'text!templates/aws/vpc/awsVpcAppTemplate.html',
        '/js/aws/models/vpc/awsVpc.js',
        '/js/aws/collections/vpc/awsVpcs.js',
        '/js/aws/views/vpc/awsVpcCreateView.js',
        'icanhaz',
        'common',
        'jquery.dataTables'
], function( $, _, Backbone, AppView, awsVpcAppTemplate, Vpc, Vpcs, AwsVpcCreateView, ich, Common ) {
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
	var AwsVpcsAppView = AppView.extend({
	    template: _.template(awsVpcAppTemplate),
	    
        modelStringIdentifier: "id",
                
        model: Vpc,
        
        idColumnNumber: 0,
        
        columns:["id","state","cidr_block","dhcp_options_id"],
        
        collectionType: Vpcs,
        
        type: "vpc",
        
        subtype: "vpcs",
        
        CreateView: AwsVpcCreateView,        
                
        events: {
            'click .create_button': 'createNew',
            'click #resource_table tr': 'toggleActions'
        },

        initialize: function(options) {
            if(options.cred_id) {
                this.credentialId = options.cred_id;
            }
            this.render();
        },
        
        toggleActions: function(e) {
            this.clickOne(e);
            //console.log($(e.currentTarget).data());
            //var rowData = $(e.currentTarget).data();
            
        }
	});
    
	return AwsVpcsAppView;
});
