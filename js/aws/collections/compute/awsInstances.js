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
        'aws/models/compute/awsInstance',
        'common'
], function( $, Backbone, Instance, Common ) {
    'use strict';

    var InstanceList = Backbone.Collection.extend({

        model: Instance,

        url: Common.apiUrl + '/stackstudio/v1/cloud_management/aws/compute/instances'
        
    });
    
    return InstanceList;

});
