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
	'common',
	'views/resource/resourceDetailView',
	'text!templates/vcloud/compute/vcloudVmsTemplate.html',
	'/js/vcloud/models/compute/vcloudVm.js',
	'/js/vcloud/collections/compute/vcloudVms.js'
], function( $, _, Backbone, ich, Common, ResourceDetailView, VCloudVmTemplate, Vm, Vms ) {
	'use strict';

	var VCloudVmsAppView = ResourceDetailView.extend({

		template : _.template(VCloudVmTemplate),

		initialize : function ( options ) {
			var appView = this;
			this.credentialId = options.cred_id;
			this.vapp = options.vapp;
			this.vdc = options.vdc;
			this.model = options.model;

			Vms.fetch({
				data : $.param({
					cred_id : options.cred_id,
					id : options.model.name,
					vdc : options.vdc,
					vapp : options.vapp
				}),

				success: function ( collection ) {
					appView.vm = appView.makeModel(collection.models[0]);

					appView.vm.id = appView.model.name;
					appView.vm.cred_id = appView.credentialId;
					appView.vm.vdc = appView.vdc;
					appView.vm.vapp = appView.vapp;

					appView.vm.loadNetwork();
					appView.vm.loadDisks();

					appView.render();
				},

				error : function ( err ) {
					console.err(err);
				}
			});

			function refreshNetwork ( network ) {
				if(!ich.templates.vm_network) {
					ich.grabTemplates();
				}

				$('#tabs-4').html(ich.vm_network(network));
			}

			function refreshDisks ( disks ) {
				if(!ich.templates.vm_disks) {
					ich.grabTemplates();
				}

				$('#tabs-5').html(ich.vm_disks({ disks : disks }));
			}


			Common.vent.on('vmAppRefresh', function ( vm ) {
				appView.vm = appView.makeModel(vm);
				appView.render();
			});


			Common.vent.on('networkLoaded', refreshNetwork);
			Common.vent.on('networkRefresh', refreshNetwork);

			Common.vent.on('disksLoaded', refreshDisks);
			Common.vent.on('disksRefresh', refreshDisks);

		},

		events: {
			"click #power_off_vm": "powerOff",
			"click #power_on_vm": "powerOn",
			"click #modify_memory" : "modifyMemory",
			"click #modify_cpu" : "modifyCpu",
			"click #update_network" : "updateNetwork"
		},
		

		powerOff : function () {
			this.vm.powerOff();
		},

		powerOn : function () {
			this.vm.powerOn();
		},

		modifyCpu : function () {
			var numCpus = parseInt($('#number_of_cpus').val(), 10);
			this.vm.modifyCpu(numCpus);
		},

		modifyMemory : function () {
			var memory = parseInt($('#memory').val(), 10);
			this.vm.modifyMemory(memory);
		},

		updateNetwork : function () {
			var options = {};
			$('[id^="network_"]').each(function () {
				var prop = $(this).attr('name')
					, val = $(this).val();

				options[prop] = $(this).val();
			});

			this.vm.updateNetwork(options);
		},

		makeModel : function ( vm ) {
			return _.extend(vm, {
				cred_id : this.credentialId,
				vdc : this.vdc,
				vapp : this.vapp,
				id : this.model.name
			});
		}
	});

	return VCloudVmsAppView;
});