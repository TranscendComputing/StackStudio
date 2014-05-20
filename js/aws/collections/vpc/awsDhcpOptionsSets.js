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
        'aws/models/vpc/awsDhcpOptionsSet',
        'common'
], function( $, Backbone, DhcpOptionsSet, Common ) {
    'use strict';

    var DhcpOptionsSetsList = Backbone.Collection.extend({

        model: DhcpOptionsSet,

        url: Common.apiUrl + '/stackstudio/v1/cloud_management/aws/compute/dhcp_options'
        
    });

    return DhcpOptionsSetsList;

});
