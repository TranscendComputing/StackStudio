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
	'gh3',
	'base64',
	'common',
	'messenger'
	], function ( $, Backbone, Gh3, Base64, Common, Messenger ) {

		var TutorialState = Backbone.Model.extend({

			baseUrl : Common.apiUrl + "/stackstudio/v1/tutorial_states",

			save : function ( state ) {
				var tutorial = this;
				$.ajax({
					url : tutorial.baseUrl,
					type: 'POST',
					contentType: 'application/x-www-form-urlencoded',
					data: state,
					success: function ( res ) {
						console.log('Tutorial state saved');
					}
				});
			},

			get : function ( account_id, cb ) {
				var tutorial = this;
				$.ajax({
					url: tutorial.baseUrl,
					type: 'GET',
					data: {
						account_id: account_id
					},
					success: function ( res ) {
						if(cb) {
							cb(res);
						}
					},
					error: function ( err, status, errorThrown ) {
						console.error(err, status, errorThrown);
					}
				});
			}
		});

		return TutorialState;
	});