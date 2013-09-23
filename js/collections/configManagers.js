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
        'models/configManager',
        'common'
], function( $, Backbone, ConfigManager, Common ) {
    'use strict';

    // Cloud Collection
    // ---------------

    var ConfigManagers = Backbone.Collection.extend({

        // Reference to this collection's model.
        model: ConfigManager,

        url: Common.apiUrl + '/stackstudio/v1/orchestration/managers',
        toJSON: function() {
            var result = {"puppet":[], "chef":[]};
            var models = this.models;
            for(var i = 0; i < models.length; i++){
                result[models[i].get("type").toLowerCase()].push(models[i].toJSON());
            }
            return result;
         },
        comparator : function(model){
            return model.get("name");
        },
        createManager : function(model, options) {
            options.wait = true;
            options.emulateHTTP =true;
            options.success= function(model){
                Common.vent.trigger("devOpsViewRefresh");
            };
            options.error = function(model, xhr) {
                Common.errorDialog(xhr.statusText, xhr.responseText);
            };
            model.url = this.url + "?org_id="+ sessionStorage.org_id;
            this.create(model,options);
        },
        deleteManager : function(data) {
            var options = {};
            var accounts = this;
            var manager = this.get(data.id);
            options.emulateHTTP = true;
            options.wait = true;
            options.success= function(model){
                Common.vent.trigger("devOpsViewRefresh");
            };
            options.error = function(model, xhr) {
                Common.errorDialog(xhr.statusText, xhr.responseText);
            };
            manager.destroy(options);
        }
    });
    Backbone.emulateHTTP=true;
    return ConfigManagers;
});
