/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true */
define([
	'underscore',
	'backbone',
	'common'
], function ( _, Backbone, Common, VCloudDataCenter ) {
	'use strict';

	var Collection = Backbone.Collection.extend({
		
		initialize : function ( options ) {
			this.options = options;
		},

		fetch : function ( options ) {

			options.data = options.data || {};

			options.data = _.extend(options.data, {
				cred_id : this.options.cred_id
			});

			return Backbone.Collection.prototype.fetch.call(this, options);
		}
	});

	return Collection;
});