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
        '/js/openstack/models/compute/openstackAvailabilityZone.js',
        'common'
], function( $, Backbone, AvailabilityZone, Common ) {
    'use strict';

    // AvailabilityZone Collection
    // ---------------

    var AvailabilityZoneList = Backbone.Collection.extend({

        // Reference to this collection's model.
        model: AvailabilityZone,

        url: Common.apiUrl + '/stackstudio/v1/cloud_management/openstack/compute/address_pools'
    });
    
    return AvailabilityZoneList;

});