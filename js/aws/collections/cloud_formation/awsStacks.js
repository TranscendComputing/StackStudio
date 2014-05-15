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
        'aws/models/cloud_formation/awsStack',
        'common'
], function( $, Backbone, Stack, Common ) {
    'use strict';


    var Stacks = Backbone.Collection.extend({

        model: Stack,

        url: Common.apiUrl + '/stackstudio/v1/cloud_management/aws/cloud_formation/stacks',

        parse: function(response){
            var result = [];
            $.grep(response, function(stack, index){
                if(stack.StackStatus !=="DELETE_COMPLETE"){
                    result.push(stack);
                }
            });
            return result;
        }
        
    });

    return Stacks;

});
