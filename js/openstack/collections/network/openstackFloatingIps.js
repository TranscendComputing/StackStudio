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
        'openstack/models/network/openstackFloatingIp',
        'common'
], function( $, _, Backbone, FloatingIp, Common ) {
    'use strict';

    // FloatingIp Collection
    // ---------------

    var FloatingIpList = Backbone.Collection.extend({

        // Reference to this collection's model.
        model: FloatingIp,

        // CloudMux url for Openstack FloatingIp APIs
        url: Common.apiUrl + '/stackstudio/v1/cloud_management/openstack/network/floating_ips'
    });

    // Create our global collection of **FloatingIps**.
    return FloatingIpList;

});
