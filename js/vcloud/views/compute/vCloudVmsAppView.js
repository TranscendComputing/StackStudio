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
  'icanhaz',
  'common',
  'views/resource/resourceAppView',
  'text!templates/vcloud/compute/vCloudInstanceAppTemplate.html',
  'vcloud/models/compute/vCloudInstance',
  'vcloud/collections/compute/vCloudInstances',
  'vcloud/views/compute/vCloudInstanceCreateView',
], function ( $, _, Backbone, , ich, Common, ResourceAppView, vCloudInstanceCreateView, vCloudInstanceAppTemplate, vCloudInstance, vCloudInstances ) {
	'use strict';

  // VCloud Instance Application View
  // ------------------------------

  /**
   * VCloudInstancesAppView is UI view list of cloud instances.
   *
   * @name InstanceAppView
   * @constructor
   * @category Resources
   * @param {Object} initialization object.
   * @returns {Object} Returns a VCloudInstancesAppView instance.
   */

	var VCloudAppView = ResourceAppView.extend({

		template : _.template(vCloudInstanceAppTemplate),

		model: vCloudInstance,

		collectionType : vCloudInstances,

		type: "compute",

		subtype: "instances",

		CreateView : vCloudInstanceCreateView,

		events : {
			'click .create-button' : 'createNew',
			'click #action_menu ul li' : 'performAction',
			'click #resource_table tr': 'clickOne'
		},

		initialize : function ( options ) {
			var app = this;

			if(options.cred_id) {
        this.credentialId = options.cred_id;
      }

      if(options.region) {
        this.region = options.region;
      }

      app.render();

      Common.vent.on("instanceAppRefresh", function () {
      	app.render();
      });
		}
	});
});