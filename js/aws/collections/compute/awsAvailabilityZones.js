/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true */
define([
        'jquery',
        'backbone',
        '/js/aws/models/compute/awsAvailabilityZone.js',
        'common'
], function( $, Backbone, AvailabilityZone, Common ) {
    'use strict';

    var AvailabilityZoneList = Backbone.Collection.extend({

        model: AvailabilityZone,

        url: Common.apiUrl + '/stackstudio/v1/cloud_management/aws/compute/availability_zones'
    });
    
    return AvailabilityZoneList;

});
