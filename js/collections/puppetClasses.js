/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true alert:true*/
define([
        'jquery',
        'backbone',
        'models/puppetClass',
        'common'
], function( $, Backbone, Class, Common) {
    'use strict';

    // Cookbook Collection
    // ---------------

    var Classes = Backbone.Collection.extend({

        // Reference to this collection's model.
        model: Class,
        //url: '../samples/cookbooks.json',
        url: Common.apiUrl + "/stackstudio/v1/orchestration/puppet/classes",

        comparator : function(model){
            return model.get("name");
        },
        parse: function(response){
            var result = [];
            for(var moduleName in response){
                if(response.hasOwnProperty(moduleName)){
                    var classes = response[moduleName];
                    for(var j = 0; j<classes.length; j++){
                        result.push(classes[j]["puppetclass"]);
                    }
                }
            }
            return result;
        },
        toJSON: function() {
            var result = {};
            $.each(this.models, function(index, model) {
                var name = model.get("name");
                var attrs = _.clone(model.attributes);
                if (name.split("::")[1]) {
                    var module = name.split("::")[0];
                    result[module].push(attrs);
                }
                else{
                    result[name] = [];
                    result[name].push(attrs);
                }
            });
            return result;
        }
        
    
    });

    return Classes;

});
