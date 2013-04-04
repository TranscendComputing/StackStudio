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
        '/js/openstack/models/block_storage/openstackVolume.js',
        'common'
], function( $, Backbone, Volume, Common ) {
    'use strict';

    // Volume Collection
    // ---------------

    var VolumesList = Backbone.Collection.extend({

        // Reference to this collection's model.
        model: Volume,

        url: Common.apiUrl + '/stackstudio/v1/cloud_management/openstack/block_storage/volumes'
    });

    // Create our global collection of **Volumes**.
    return VolumesList;

});
