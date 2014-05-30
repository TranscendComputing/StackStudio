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
        'openstack/models/network/openstackRouter',
        'common'
], function( $, _, Backbone, Router, Common ) {
    'use strict';

    // Router Collection
    // ---------------

    var RouterList = Backbone.Collection.extend({

        // Reference to this collection's model.
        model: Router,

        // CloudMux url for Openstack Router APIs
        url: Common.apiUrl + '/stackstudio/v1/cloud_management/openstack/network/routers'
    });

    // Create our global collection of **Routers**.
    return RouterList;

});