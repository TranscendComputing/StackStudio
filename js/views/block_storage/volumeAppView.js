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
        'text!templates/block_storage/volumeAppTemplate.html',
        'models/block_storage/volume',
        'collections/block_storage/volumes',
        'views/block_storage/volumeRowView',
        'views/block_storage/volumeCreateView',
        'icanhaz',
        'common',
        'jquery.dataTables'
], function( $, _, Backbone, volumeAppTemplate, Volume, volumes, VolumeRowView, CreateView, ich, Common ) {
	'use strict';

	// Volume Application View
	// ------------------------------

    /**
     * VolumeAppView is UI view list of cloud volumes.
     *
     * @name VolumeAppView
     * @constructor
     * @category Resources
     * @param {Object} initialization object.
     * @returns {Object} Returns a VolumeAppView instance.
     */
	var AppView = Backbone.View.extend({
		/** The ID of the selected volume */
		selectedId: undefined,
		
		el: '#resource_app',

		render: function() {
			//If volume id is supplied, select it
			if(this.selectedId) {
				this.selectOne(this.selectedId, $("tr:contains("+this.selectedId+")"));
			}
		},

		// Add a single row item to the list by creating a view for it.
		addOne: function( rowItem ) {
			if (rowItem.get('id') === "") {
				// Refuse to add rows until they're initialized.
				return;
			}
			var view = new VolumeRowView({ model: rowItem });
			view.render();
		},

		// Add all items in the collection at once.
		addAll: function() {
			this.collection.each(this.addOne, this);
		},

		createNew : function () {
			var createForm = new CreateView();
			createForm.render();
		},

		selectOne : function (itemId, parentNode) {
            var selectedModel;
            this.clearSelection();
            console.log(ich);
            if(parentNode) {
                $(parentNode).addClass('row_selected');
            }
            
            this.collection.each(function(item) {
                if (item.get('id').toString() === itemId) {
                    selectedModel = item;
                }
            });

            if(selectedModel) {
                this.selectedId = itemId;
                $("#details").html(ich.resource_detail(selectedModel.attributes));
                $("#detail_tabs").tabs();
            }else {
                
            }
        },
        
        clearSelection: function () {
            this.$table.$('tr').removeClass('row_selected');
            $('#details').html("");
        }
	});

    console.log("app view defined");
    
	return AppView;
});
