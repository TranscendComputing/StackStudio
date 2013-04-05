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
        '/js/openstack/models/network/openstackPort.js',
        'common'
], function( $, _, Backbone, Port, Common ) {
    'use strict';

    // Port Collection
    // ---------------

    var PortList = Backbone.Collection.extend({

        // Reference to this collection's model.
        model: Port,

        // CloudMux url for Openstack Port APIs
        url: Common.apiUrl + '/stackstudio/v1/cloud_management/openstack/network/ports'
    });

    // Create our global collection of **Ports**.
    return PortList;

});
