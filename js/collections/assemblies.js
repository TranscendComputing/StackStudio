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
        'models/assembly',
        'common',
        'messenger'
], function( $, Backbone, Assembly, Common, Messenger) {
	'use strict';

	// Cloud Account Collection
	// ---------------

	var AssembliesList = Backbone.Collection.extend({

		// Reference to this collection's model.
		model: Assembly,
        url: Common.apiUrl + "/stackstudio/v1/assemblies/",
        comparator : function(model){
            return model.get("name");
        },
        fetch: function(options){
            options.data = $.param({account_id:sessionStorage.account_id});
            Backbone.Collection.prototype.fetch.apply(this, arguments);
        },


		createAssembly : function(model, options) {
            options.wait = true;
            options.emulateHTTP =true;
            options.success= function(model){
                new Messenger().post({message:model.get("name")+ " created", type:"success"});
                Common.vent.trigger("assembliesViewRefresh", model);
            };
            options.error = function(model, xhr) {
                Common.errorDialog(xhr.statusText, xhr.responseText);
            };
            this.create(model.attributes,options);
        },
        deleteAssembly : function(id) {
            var options = {};
            var accounts = this;
            var assembly = this.get(id);
            options.emulateHTTP = true;
            options.wait = true;
            options.success= function(model){
                accounts.remove(model);
                new Messenger().post({message:model.get("name") +" deleted", type:"success"});
                Common.vent.trigger("assembliesViewRefresh");
            };
            options.error = function(model, xhr) {
                Common.errorDialog(xhr.statusText, xhr.responseText);
            };
            assembly.destroy(options);
        }
	});
	Backbone.emulateHTTP = true;
	return AssembliesList;

});
