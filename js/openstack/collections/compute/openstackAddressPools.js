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
        '/js/openstack/models/compute/openstackAddressPool.js',
        'common'
], function( $, Backbone, AddressPool, Common ) {
    'use strict';

    var AddressPoolList = Backbone.Collection.extend({

        model: AddressPool,

        url: Common.apiUrl + '/stackstudio/v1/cloud_management/openstack/compute/address_pools'
    });

    return AddressPoolList;

});
