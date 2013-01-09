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
        'common',
        'jquery.coverscroll.min'
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

        selection: undefined,
        
		initialize: function() {
			this.$el.addClass("twelvecol");
            var compiledTemplate = _.template(resourcesTemplate);
            this.$el.html(compiledTemplate);

            $('#container').coverscroll({
                'minfactor':18, // how much is the next item smaller than previous in pixels
                'distribution':1, // how apart are the items (items become separated when this value is below 1)
                'scalethreshold':0, // after how many items to start scaling
                'staticbelowthreshold':false, // if true when number of items is below "scalethreshold" - don't animate 
                'titleclass':'itemTitle', // class name of the element containing the item title
                'selectedclass':'selectedItem', // class name of the selected item
                'scrollactive':true, // scroll functionality switch
                'step':{ // compressed items on the side are steps
                	'limit':4, // how many steps should be shown on each side
                	'width':8, // how wide is the visible section of the step in pixels
                	'scale':true // scale down steps
                },
                'bendamount':2, // amount of "bending" of the CoverScroll (values 0.1 to 1 bend down, -0.1 to -1 bend up, 2 is straight (no bending), 1.5 sligtly bends down)
              	'movecallback':function(item){} // callback function triggered after click on an item - parameter is the item's jQuery object
              });
		},
		
		events: {
			"click .resourceLink" : "resourceClick"
		},
		
		resourceClick: function(id) {
			var selectionId = id.target.id;
			this.resourceSelect(selectionId);
		},
		
		resourceSelect: function(selectionId) {
			$('.resource').each(function() {
				if(selectionId === $(this).find(":first").attr("id")) {
					$(this).css("background", "wheat");
				}else {
					$(this).css("background", "#E6E9ED");
				}
	        });
			console.log(selectionId + " selected");
		}
		
	});
	
	var resourcesView;
	
    Common.router.on('route:resources', function () {
        if (!resourcesView) {
            resourcesView = new ResourcesView();
        }
        resourcesView.resourceSelect("ec2");
        console.log("resources view: resources route");
        
    }, this);
    
    Common.router.on('route:instances', function () {
        if (!resourcesView) {
            resourcesView = new ResourcesView();
        }
        resourcesView.resourceSelect("ec2");
        console.log("resources view: instances route");
    }, this);
    
    Common.router.on('route:instanceDetail', function (id) {
        if (!resourcesView) {
            resourcesView = new ResourcesView();
        }
        resourcesView.resourceSelect("ec2");
        console.log("resources view: instance detail route");
    }, this);
    
    console.log("resource view defined");

	return ResourcesView;
});
