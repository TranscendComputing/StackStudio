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
        'models/volume/volume',
        'common'
], function( $, Backbone, Volume, Common ) {
	'use strict';

	// Volume Collection
	// ---------------

	var VolumeList = Backbone.Collection.extend({

		// Reference to this collection's model.
		model: Volume,

		url: 'volumes.json',

		// Filter down the list of all volume items that are available.
		available: function() {
			return this.filter(function( volume ) {
				return volume.get('status') === 'available';
			});
		}
	});

	// Create our global collection of **Volumes**.
	return new VolumeList();

});
