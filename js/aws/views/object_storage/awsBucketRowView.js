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
        'backbone'
], function( $, _, Backbone ) {
	'use strict';

	var RowView = Backbone.View.extend({

		events: {
		},

		initialize: function() {
			this.model.on( 'change', this.render, this );
			this.model.on( 'destroy', this.remove, this );
			this.model.on( 'visible', this.toggleVisible, this );
		},

		// Populate the column values in the table with the model.
		render: function() {
			var selector_i = "#resource_table tr:nth-child(";
			var added = $('#resource_table').dataTable().
				fnAddData( [
				            this.model.get("Name")
				            ]
			);
			this.setElement( $(selector_i+(added[0]+1)+')') );
			this.$el.data(this.model.toJSON());
			return this;
		}
	});

	return RowView;
});
