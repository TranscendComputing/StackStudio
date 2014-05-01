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
	'/js/vcloud/models/network/vcloudNetwork.js',
	'/js/vcloud/collections/network/vcloudNetworks.js'
], function( $, _, Backbone, Common, ResourceDetailView, VCloudNetworkTemplate, Network, Networks ) {
	'use strict';

	var VCloudNetworkAppView = ResourceDetailView.extend({

		initialize : function ( options ) {
			var appView = this;
			this.credentialId = options.cred_id;

			Networks.fetch({
				data : $.param({
					cred_id : options.cred_id,
					id : options.model.id
				}),

				success: function ( collection ) {
					appView.network = appView.makeModel(collection.models[0]);
					appView.render();
				},

				error : function ( err ) {
					console.err(err);
				}
			});

			Common.vent.on('networkAppRefresh', function ( network ) {
				appView.network = appView.makeModel(network);
				appView.render();
			});
		},
	
		template : _.template(VCloudNetworkTemplate),

		makeModel : function ( network ) {
			return _.extend(network, {
				cred_id : this.credentialId
			});
		}
	});

	return VCloudNetworkAppView;
});