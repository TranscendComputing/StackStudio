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
        'text!templates/aws/vpc/awsInternetGatewayAppTemplate.html',
        '/js/aws/models/vpc/awsInternetGateway.js',
        '/js/aws/collections/vpc/awsInternetGateways.js',
        '/js/aws/views/vpc/awsInternetGatewayCreateView.js',
        'icanhaz',
        'common',
        'jquery.dataTables'
], function( $, _, Backbone, AppView, awsInternetGatewayAppTemplate, InternetGateway, internetGateways, AwsInternetGatewayCreateView, ich, Common ) {
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
	var AwsInternetGatewaysAppView = AppView.extend({
	    template: _.template(awsInternetGatewayAppTemplate),
	    
        modelStringIdentifier: "internetGatewayId",
                
        model: InternetGateway,
        
        idColumnNumber: 0,
        
        columns: ["internetGatewayId"],
        
        collection: internetGateways,
        
        type: "vpc",
        
        subtype: "internetGateways",
        
        CreateView: AwsInternetGatewayCreateView,
                
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
            
            var rowData = $(e.currentTarget).data();
            $.each(rowData.attachmentSet, function(index, attachment) {
                $("#attachments_table").dataTable().fnAddData([
                    attachment.vpcId,
                    attachment.state
                ]);
            });            
        }
	});
    
	return AwsInternetGatewaysAppView;
});
