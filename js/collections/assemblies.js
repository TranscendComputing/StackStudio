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

	var AppList = Backbone.Collection.extend({

		// Reference to this collection's model.
		model: Assembly,
        url: Common.apiUrl + "/stackstudio/v1/assemblies/",
        comparator : function(model){
            return model.get("name");
        },

		createAssembly : function(model, options) {
            options.wait = true;
            options.emulateHTTP =true;
            options.success= function(model){
                new Messenger().post({message:"Assembly created.", type:"success"});
                Common.vent.trigger("assembliesViewRefresh");
            };
            options.error = function(model, xhr) {
                Common.errorDialog(xhr.statusText, xhr.responseText);
            };
            model.url = this.url;
            this.create(model,options);
        },
        deleteAssembly : function(id) {
            var options = {};
            var accounts = this;
            var assembly = this.get(id);
            options.emulateHTTP = true;
            options.wait = true;
            options.success= function(model){
                accounts.remove(model);
                new Messenger().post({message:model.get("name") +" deleted successfully.", type:"success"});
                Common.vent.trigger("assembliesViewRefresh");
            };
            options.error = function(model, xhr) {
                Common.errorDialog(xhr.statusText, xhr.responseText);
            };
            assembly.destroy(options);
        }
	});
	Backbone.emulateHTTP = true;
	return AppList;

});
