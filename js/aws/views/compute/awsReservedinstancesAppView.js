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
        'text!templates/aws/compute/awsReservedInstanceAppTemplate.html',
        '/js/aws/models/compute/awsReservedInstance.js',
        '/js/aws/collections/compute/awsReservedInstances.js',
        '/js/aws/views/compute/awsReservedInstanceCreateView.js',
        'icanhaz',
        'common',
        'jquery.dataTables'
], function( $, _, Backbone, ResourceAppView, awsReservedInstanceAppTemplate, Reservedinstance, Reservedinstances, AwsReservedInstanceCreate, ich, Common ) {
    'use strict';

    // Aws Reserved Instance Application View
    // ------------------------------

    /**
     * AwsReservedInstanceAppView is UI view list of aws spot instances.
     *
     * @name AwsReservedInstanceAppView
     * @constructor
     * @category Resources
     * @param {Object} initialization object.
     * @returns {Object} Returns a AwsReserveInstanceAppView instance.
     */
    var AwsReservedInstanceAppView = ResourceAppView.extend({
        template: _.template(awsReservedInstanceAppTemplate),
        
        modelStringIdentifier: "reservedInstancesId",
        
        columns: ["reservedInstancesId", "instanceType", "state"],
        
        idColumnNumber: 0,
        
        model: Reservedinstance,
        
        collectionType: Reservedinstances,
        
        type: "compute",
        
        subtype: "reservedinstances",
        
        CreateView: AwsReservedInstanceCreate,
        
        events: {
            'click .create_button': 'createNew',
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

            var reservedInstanceApp = this;
            Common.vent.on("reservedInstanceAppRefresh", function() {
                reservedInstanceApp.render();
            });
        },
        
        toggleActions: function(e) {
            //Disable any needed actions
        }
    });
    
    return AwsReservedInstanceAppView;
});
