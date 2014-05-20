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
        'aws/models/vpc/awsVpc',
        'common'
], function( $, Backbone, Vpc, Common ) {
    'use strict';

    var VpcsList = Backbone.Collection.extend({

        model: Vpc,

        url: Common.apiUrl + '/stackstudio/v1/cloud_management/aws/compute/vpcs'
        
    });

    return VpcsList;

});
