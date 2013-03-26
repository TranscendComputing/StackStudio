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
        '/js/openstack/models/block_storage/openstackSnapshot.js',
        'common'
], function( $, Backbone, Snapshot, Common ) {
    'use strict';

    // Snapshot Collection
    // ---------------

    var SnapshotList = Backbone.Collection.extend({

        // Reference to this collection's model.
        model: Snapshot,

        // CloudMux url for AWS EBS snapshots
        url: Common.apiUrl + '/stackstudio/v1/cloud_management/openstack/block_storage/snapshots'
    });

    // Create our global collection of **Volumes**.
    return SnapshotList;

});
