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
        '/js/openstack/models/identity/openstackTenant.js',
        'common'
], function( $, _, Backbone, Tenant, Common ) {
    'use strict';

    // Tenant Collection
    // ---------------

    var TenantsList = Backbone.Collection.extend({

        // Reference to this collection's model.
        model: Tenant,

        // CloudMux URL for Openstack Tenant APIs
        url: Common.apiUrl + '/stackstudio/v1/cloud_management/openstack/identity/tenants'
    });

    // Create our global collection of **Tenants**.
    return TenantsList;

});
