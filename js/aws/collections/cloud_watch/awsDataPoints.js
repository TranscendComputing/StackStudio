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
        '/js/aws/models/cloud_watch/awsDataPoint.js',
        'common'
], function( $, Backbone, DataPoint, Common ) {
    'use strict';

    // DataPoint Collection
    // ---------------

    var DataPointList = Backbone.Collection.extend({

        // Reference to this collection's model.
        model: DataPoint,

        url: 'samples/cpuDataPoints.json'
    });
    
    // Create our global collection of **DataPoints**.
    return DataPointList;

});
