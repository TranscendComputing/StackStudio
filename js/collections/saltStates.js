/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true alert:true*/
define([
        'jquery',
        'underscore',
        'backbone',
        'models/saltState',
        'common'
], function( $, _, Backbone, State, Common) {
    'use strict';

    var States = Backbone.Collection.extend({

        // Reference to this collection's model.
        model: State,
        url: '../samples/saltStates.json',
        //url: Common.apiUrl + "/stackstudio/v1/orchestration/salt/states",

        comparator : function(model){
            return model.get("name");
        },
        parse: function(response){
            var result = [];
            for(var i =0; i < response.length; i++){
                result.push({name:response[i]});
            }
            return result;
        },
        toJSON: function() {
            var $this = this;
            var result = {};
            $this.each(function(value){
                var name = value.id;
                var treeName;
                if(name.split(".")[1]){
                    treeName = name.split(".")[0];
                }else{
                    treeName = name;
                }

                if(!result[treeName]){
                    result[treeName] = [];
                }
                result[treeName].push({name:name});
            });
            return result;
        }
        
    
    });

    return States;

});