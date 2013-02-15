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
], function( $, _, Backbone, AppView, awsSubnetAppTemplate, Subnet, subnets, AwsSubnetCreateView, ich, Common ) {
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
	    
        modelStringIdentifier: "subnetId",
                
        model: Subnet,
        
        idColumnNumber: 1,
        
        columns: ["state","subnetId","vpcId","cidrBlock","availabiltyZone","availableIpAddressCount"],
        
        collection: subnets,
        
        type: "vpc",
        
        subtype: "subnets",
        
        CreateView: AwsSubnetCreateView,
                
        events: {
            'click .create_button': 'createNew',
            'click #resource_table tr': 'toggleActions'
        },

        initialize: function() {
            this.render();
        },
        
        toggleActions: function(e) {
            this.clickOne(e);
            
            $(".display_table").dataTable({
               "bPaginate": false,
               "bSortable": false,
               "bFilter": false,
               "bInfo": false,
               "bLengthChange": false,
               "bJQueryUI": true
            });
            
            //console.log($(e.currentTarget).data());
            //var rowData = $(e.currentTarget).data();
            
        }
	});
    
	return AwsSubnetsAppView;
});
