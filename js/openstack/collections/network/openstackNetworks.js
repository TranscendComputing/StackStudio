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
        '/js/openstack/models/network/openstackNetwork.js',
        'common'
], function( $, _, Backbone, Network, Common ) {
    'use strict';

    // Network Collection
    // ---------------

    var NetworkList = Backbone.Collection.extend({

        // Reference to this collection's model.
        model: Network,

        // CloudMux url for Openstack Network APIs
        url: Common.apiUrl + '/stackstudio/v1/cloud_management/openstack/network/networks'
    });

    // Create our global collection of **Networks**.
    return NetworkList;

});
