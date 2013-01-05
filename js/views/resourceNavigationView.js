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
        'text!templates/resources/resourcesTemplate.html',
        'icanhaz',
        'common'
], function( $, _, Backbone, resourcesTemplate, ich, Common ) {
	// The Resources Navigation View
	// ------------------------------

    /**
     * ResourcesView is UI view of resource services.
     *
     * @name ResourcesView
     * @constructor
     * @category Resources
     * @param {Object} initialization object.
     * @returns {Object} Returns a ResourcesView project.
     */
	var ResourcesView = Backbone.View.extend({
		// Instead of generating a new element, bind to the existing skeleton of
		// the App already present in the HTML.
		el: '#main',

		initialize: function() {
            var compiledTemplate = _.template(resourcesTemplate);
            var selection;
            this.$el.html(compiledTemplate)
		},
		   	
		events: {
			"click .resourceLink" : "resourceSelect"
		},
		
		resourceSelect: function(id) {
			selection = id;
			$('.resource').each(function() {
				if(selection.target.id == $(this).find(":first").attr("id")) {
					$(this).css("background", "#CB842E");
				}else {
					$(this).css("background", "#E6E9ED");
				}
	        });
			console.log(selection.target.id + " selected.");
		}
		
	});
	
	var resourcesView;
	
    Common.router.on('route:resources', function () {
        if (!resourcesView) {
            resourcesView = new ResourcesView();
        }
        console.log("Got resource route.");
        
    }, this);
    
    Common.router.on('route:instances', function () {
        if (!resourcesView) {
            resourcesView = new ResourcesView();
        }
        console.log("Got resource instance route.");
    }, this);
    
    Common.router.on('route:instanceDetail', function (id) {
        if (!resourcesView) {
            resourcesView = new ResourcesView();
        }
        console.log("Got resource instance detail " + id + " route.");
    }, this);

	return ResourcesView;
});
