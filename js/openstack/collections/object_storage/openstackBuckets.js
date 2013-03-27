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
        '/js/openstack/models/object_storage/openstackBucket.js',
        'common'
], function( $, Backbone, Bucket, Common ) {
    'use strict';

    // Bucket Collection
    // ---------------

    var BucketsList = Backbone.Collection.extend({

        // Reference to this collection's model.
        model: Bucket,

        url: Common.apiUrl + '/stackstudio/v1/cloud_management/openstack/object_storage/directories'
    });

    // Create our global collection of **Buckets**.
    return BucketsList;

});
