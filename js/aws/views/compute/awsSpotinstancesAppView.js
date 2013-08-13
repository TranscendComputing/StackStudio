/*!
 * (c) Copyright 2012-2013 Transcend Computing, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the License);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an AS IS BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
        '/js/aws/models/compute/awsSpotInstanceRequest.js',
        '/js/aws/collections/compute/awsSpotInstanceRequests.js',
        '/js/aws/views/compute/awsSpotInstanceCreateView.js',
        '/js/aws/views/compute/awsSpotPriceHistoryView.js',
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
