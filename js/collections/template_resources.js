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
        'models/template_resource',
        'common'
], function( $, Backbone, TemplateResource, Common ) {
	'use strict';

	// TemplateResource Collection
	// ---------------

	var TemplateResourceList = Backbone.Collection.extend({

		// Reference to this collection's model.
		model: TemplateResource,

		url: 'samples/cloud_resources.json'

	});

	// Create our global collection of **TemplateResources**.
	return new TemplateResourceList();

});