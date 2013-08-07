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
        '/js/aws/models/object_storage/awsBucket.js',
        'common'
], function( $, Backbone, Bucket, Common ) {
    'use strict';

    var BucketsList = Backbone.Collection.extend({

        model: Bucket,

        url: Common.apiUrl + '/stackstudio/v1/cloud_management/aws/object_storage/directories'
    });

    return BucketsList;

});
