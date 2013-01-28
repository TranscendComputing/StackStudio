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
        '/js/aws/models/cloud_watch/awsAlarm.js',
        'common'
], function( $, Backbone, Alarm, Common ) {
    'use strict';

    // Alarm Collection
    // ---------------

    var AlarmList = Backbone.Collection.extend({

        // Reference to this collection's model.
        model: Alarm,

        url: 'samples/alarms.json'
    });
    
    // Create our global collection of **Alarms**.
    return new AlarmList();

});
