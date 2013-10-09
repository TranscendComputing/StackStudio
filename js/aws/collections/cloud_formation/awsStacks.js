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
        '/js/aws/models/cloud_formation/awsStack.js',
        'common'
], function( $, Backbone, Stack, Common ) {
    'use strict';


    var Stacks = Backbone.Collection.extend({

        model: Stack,

        url: Common.apiUrl + '/stackstudio/v1/cloud_management/aws/cloud_formation/stacks'
        
    });

    return Stacks;

});
