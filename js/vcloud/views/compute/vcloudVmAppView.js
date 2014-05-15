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
	'vcloud/models/compute/vcloudVm',
	'vcloud/collections/compute/vcloudVms'
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
			this.model.loadNetwork();
			this.model.loadDisks();
			this.render();

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
		}
	});

	return VCloudVmsAppView;
});
