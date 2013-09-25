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
        'models/packedImage',
        'common'
], function( $, Backbone, PackedImage, Common) {
	'use strict';

	var PackedImageList = Backbone.Collection.extend({

		model: PackedImage,

        url: function(){return Common.apiUrl + "/stackstudio/v1/packed_images/";}
	
	});

	return PackedImageList;

});
