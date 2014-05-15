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
	'common',
	'views/resource/resourceDetailView',
	'text!templates/vcloud/network/vcloudNetworkTemplate.html',
	'vcloud/models/network/vcloudNetwork',
	'vcloud/collections/network/vcloudNetworks'
], function( $, _, Backbone, Common, ResourceDetailView, VCloudNetworkTemplate, Network, Networks ) {
	'use strict';

	var VCloudNetworkAppView = ResourceDetailView.extend({

		initialize : function ( options ) {
			this.render();
		},
	
		template : _.template(VCloudNetworkTemplate)
	});

	return VCloudNetworkAppView;
});
