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
        'text!templates/aws/compute/awsSpotInstanceAppTemplate.html',
        'aws/models/compute/awsSpotInstanceRequest',
        'aws/collections/compute/awsSpotInstanceRequests',
        'aws/views/compute/awsSpotInstanceCreateView',
        'aws/views/compute/awsSpotPriceHistoryView',
        'icanhaz',
        'common',
        'jquery.dataTables'
], function( $, _, Backbone, ResourceAppView, awsSpotInstanceAppTemplate, Spotinstance, Spotinstances, AwsSpotInstanceCreate, SpotHistoryView, ich, Common ) {
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
        
        modelStringIdentifier: "id",
        
        columns: ["id", "price", "image_id", "instance_id", "flavor_id", "state"],
        
        idColumnNumber: 0,
        
        model: Spotinstance,
        
        collectionType: Spotinstances,
        
        type: "compute",
        
        subtype: "spotinstances",
        
        CreateView: AwsSpotInstanceCreate,

        events: {
            'click .create_button': 'createNew',
            'click #action_menu ul li': 'performAction',
            'click #price_history_button': 'priceHistory',
            'click #resource_table tr': 'clickOne'
        },

        initialize: function(options) {
            if(options.cred_id) {
                this.credentialId = options.cred_id;
            }
            if(options.region) {
                this.region = options.region;
            }
            this.render();
            
            var spotInstanceApp = this;
            Common.vent.on("spotInstanceAppRefresh", function() {
                spotInstanceApp.render();
            });
        },

        toggleActions: function(e) {
            //Disable any needed actions
        },
        
        performAction: function(event) {
            var spotInstance = this.collection.get(this.selectedId);
            
            switch(event.target.text)
            {
            case "Cancel":
                spotInstance.cancel(this.credentialId, this.region);
                break;
            }
        },
        
        priceHistory: function() {
            new SpotHistoryView({cred_id: this.credentialId, region: this.region});
        }
    });
    
    return AwsSpotInstanceAppView;
});
