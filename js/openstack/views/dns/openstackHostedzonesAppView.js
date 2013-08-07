/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true */
define([
    '/js/topstack/views/dns/topstackHostedzonesAppView.js',
    '/js/openstack/views/dns/openstackHostedZoneCreateView.js',
    '/js/openstack/views/dns/openstackRecordSetCreateView.js'
], function( TopStackHostedZonesAppView, OpenStackHostedZoneCreateView, OpenStackRecordSetCreateView ) {
    'use strict';

    var OpenstackHostedZoneAppView = TopStackHostedZonesAppView.extend({
        
        CreateView: OpenStackHostedZoneCreateView,

        RecordSetCreateView: OpenStackRecordSetCreateView

    });
    
    return OpenstackHostedZoneAppView;
});