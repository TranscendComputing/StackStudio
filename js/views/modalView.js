/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true, laxcomma:true */
/*global define:true console:true */
define([
	'jquery',
	'underscore',
	'backbone',
	'icanhaz',
	'common'
], function( $, _, Backbone, ich, Common ) {
	'use strict';

	var ModalView = Backbone.View.extend({

		el : '#modal-placeholder',

		createModal : function ( options ) {
			options = options || {};
			this.$el.modal({
				show : options.show || false,
				keyboard : options.keyboard || true,
				backdrop : options.backdrop || true
			});

			this.$el.on('hidden.bs.modal', function () {
			    $(this).data('bs.modal', null);
			});
		},

		render : function () {
			this.$el.modal('show', true);
			return this;
		},

		close : function () {
			this.$el.data('bs.modal', null);
		}
	});

	return ModalView;
});