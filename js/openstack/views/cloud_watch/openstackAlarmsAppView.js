/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true */
define([
    'topstack/views/cloud_watch/topstackAlarmsAppView',
    'openstack/views/cloud_watch/openstackAlarmCreateView'
], function( TopStackAlarmsAppView, OpenStackAlarmCreateView ) {
    'use strict';

    var OpenstackAlarmAppView = TopStackAlarmsAppView.extend({
        
        CreateView: OpenStackAlarmCreateView

    });
    
    return OpenstackAlarmAppView;
});
