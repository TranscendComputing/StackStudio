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
        'models/offering',
        'common'
], function( $, Backbone, Offering, Common) {
	'use strict';

	// Cloud Account Collection
	// ---------------

	var OfferingList = Backbone.Collection.extend({

		// Reference to this collection's model.
		model: Offering,
        url: '../samples/offerings.json'
	
	});

	return OfferingList;

});
