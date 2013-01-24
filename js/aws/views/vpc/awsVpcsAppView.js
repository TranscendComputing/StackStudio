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
], function( $, _, Backbone, AppView, awsVpcAppTemplate, Vpc, vpcs, AwsVpcCreateView, ich, Common ) {
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
	    
        modelStringIdentifier: "vpcId",
                
        model: Vpc,
        
        idRowNumber: 0,
        
        columns:["vpcId","state","cidrBlock","dhcpOptionsId"],
        
        collection: vpcs,
        
        type: "vpc",
        
        subtype: "vpcs",
        
        CreateView: AwsVpcCreateView,        
                
        events: {
            'click .create_button': 'createNew',
            'click #resource_table tr': 'toggleActions'
        },

        initialize: function() {
            this.render();
            $(".action_menu").on( "menuselect", this.setAction );
        },
        
        setAction: function(e, ui) {
            console.log(e, ui);
            console.log("PERFORMING ACTION");
            return false
        },
        
        toggleActions: function(e) {
            this.clickOne(e);
            //console.log($(e.currentTarget).data());
            //var rowData = $(e.currentTarget).data();
            
        }
	});
    
	return AwsVpcsAppView;
});
