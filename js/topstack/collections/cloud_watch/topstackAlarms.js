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
        '/js/topstack/models/cloud_watch/topstackAlarm.js',
        'common'
], function( $, Backbone, Alarm, Common ) {
    'use strict';

    var AlarmList = Backbone.Collection.extend({

        model: Alarm,

        url: Common.apiUrl + '/stackstudio/v1/cloud_management/topstack/monitor/alarms'
    });
    
    return AlarmList;

});
