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
        'text!templates/aws/compute/awsSpotInstanceAppTemplate.html',
        '/js/aws/models/compute/awsSpotInstanceRequest.js',
        '/js/aws/collections/compute/awsSpotInstanceRequests.js',
        '/js/aws/views/compute/awsSpotInstanceRowView.js',
        '/js/aws/views/compute/awsSpotInstanceCreateView.js',
        'icanhaz',
        'common',
        'jquery.dataTables'
], function( $, _, Backbone, ResourceAppView, awsSpotInstanceAppTemplate, Spotinstance, spotinstances, AwsSpotInstanceRowView, AwsSpotInstanceCreate, ich, Common ) {
    'use strict';

    // Aws Spot Instance Application View
    // ------------------------------

    /**
     * AwsSpotInstanceAppView is UI view list of aws spot instances.
     *
     * @name AwsSpotInstanceAppView
     * @constructor
     * @category Resources
     * @param {Object} initialization object.
     * @returns {Object} Returns a AwsSpotInstanceAppView instance.
     */
    var AwsSpotInstanceAppView = ResourceAppView.extend({
        template: _.template(awsSpotInstanceAppTemplate),
        
        modelStringIdentifier: "spotInstanceRequestId",
        
        idColumnNumber: 0,
        
        model: Spotinstance,
        
        collection: spotinstances,
        
        type: "compute",
        
        subtype: "spotinstance",
        
        CreateView: AwsSpotInstanceCreate,
        
        RowView: AwsSpotInstanceRowView,
        
        events: {
            'click .create_button': 'createNew',
            'click #resource_table tr': 'toggleActions'
        },

        initialize: function() {
            this.render();
            $("#action_menu").on( "menuselect", this.setAction );
        },
        
        setAction: function(e, ui) {
            console.log(e, ui);
            console.log("PERFORMING ACTION");
            return false
        },
        
        toggleActions: function(e) {
            this.clickOne(e);
            var rowData = this.$table.fnGetData(e.currentTarget);
            if (rowData[3]) {
                console.log($("#action_menu").menu("widget"));
            }
        }
    });
    
    return AwsSpotInstanceAppView;
});