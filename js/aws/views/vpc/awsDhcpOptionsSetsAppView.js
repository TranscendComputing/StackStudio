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
], function( $, _, Backbone, AppView, awsDhcpOptionsSetAppTemplate, DhcpOptionsSet, dhcpOptionsSets, AwsDhcpOptionsSetCreateView, ich, Common ) {
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
	    
        modelStringIdentifier: "dhcpOptionsId",
                
        model: DhcpOptionsSet,
        
        idColumnNumber: 0,
        
        columns: ["dhcpOptionsId"],
        
        collection: dhcpOptionsSets,
        
        type: "vpc",
        
        subtype: "dhcpOptionsSets",
        
        CreateView: AwsDhcpOptionsSetCreateView,
                
        events: {
            'click .create_button': 'createNew',
            'click #resource_table tr': 'toggleActions'
        },

        initialize: function() {
            this.render();
        },
        
        toggleActions: function(e) {
            this.clickOne(e);           
        }
	});
    
	return AwsDhcpOptionsSetsAppView;
});
