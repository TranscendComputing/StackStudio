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
        'google/models/compute/googleFirewall',
        'common'
], function( $, Backbone, Firewall, Common ) {
    'use strict';

    var FirewallList = Backbone.Collection.extend({

        model: Firewall,

        url: Common.apiUrl + '/stackstudio/v1/cloud_management/google/compute/firewalls'
        
    });
    
    return FirewallList;

});
