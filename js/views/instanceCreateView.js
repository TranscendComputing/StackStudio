/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true */
define([
        'jquery',
        'underscore',
        'backbone',
        'text!templates/resources/instanceCreateTemplate.html',
        'models/instance',
        'icanhaz',
        'common',
        'wijmo'
], function( $, _, Backbone, instanceCreateTemplate, Instance, ich, Common ) {
	
    /**
     * InstanceCreateWizardView is UI wizard to create cloud instances.
     *
     * @name InstanceCreateWizardView
     * @constructor
     * @category Instance
     * @param {Object} initialization object.
     * @returns {Object} Returns a InstanceCreateWizardView instance.
     */
	
	var InstanceCreateView = Backbone.View.extend({
		
		tagName: "div",
		
		// Delegated events for creating new instances, etc.
		events: {
			
		},

		initialize: function() {
			var compiledTemplate = _.template(instanceCreateTemplate);
            this.$el.html(compiledTemplate);

            this.$el.wijdialog({
                autoOpen: true,
                title: "Create Instance",
                resizable: false,
                modal: true,
                captionButtons: {
                    refresh: {visible: false},
                    pin: {visible: false},
                    toggle: {visible: false},
                    minimize: {visible: false},
                    maximize: {visible: false}
                }
          });
            
          $(".form_button").button();
		},

		render: function() {
			
		}

	});

    console.log("instance create view defined");
    
	return InstanceCreateView;
});
