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
	'views/modalView',
	'text!templates/vcloud/compute/vcloudVmTemplate.html',
	'/js/vcloud/models/compute/vcloudVm.js',
	'/js/vcloud/collections/compute/vcloudVms.js'
], function( $, _, Backbone, ich, Common, ModalView, VCloudVmTemplate, Vm, Vms ) {
	'use strict';

	var VCloudVmsAppView = ModalView.extend({

		template : _.template(VCloudVmTemplate),

		events: {
			"click #power_off_vm": "powerOff",
			"click #power_on_vm": "powerOn",
			"click #modify_vm" : "modifyVm",
			"click #update_network" : "updateNetwork",
			"click #create_disk" : "createDisk",
			"click #create_disk_submit" : "createDiskSubmit"
		},

		initialize : function ( options ) {
			var appView = this;
			this.credentialId = options.cred_id;
			this.vapp = options.vapp;
			this.vdc = options.data_center;
			this.model = options.model;
			
			Common.vent.on('networkLoaded', this.refreshNetwork);
			Common.vent.on('networkRefresh', this.refreshNetwork);

			Common.vent.on('disksLoaded', this.refreshDisks);
			Common.vent.on('disksRefresh', this.refreshDisks);

			this.vmOptions = {
				cred_id : this.credentialId,
				vdc_id : this.vdc,
				vapp_id : this.vapp,
				vm_id : this.model.attributes.id
			};

			this.$el.find('.modal-body').html(this.template);
			
			if(!ich.templates.resource_detail_modal) {
				ich.grabTemplates();
			}
			
			$.each(this.model.attributes, function ( attr ) {
				attr = attr.capitalize();
			});

			//replace template variables
			this.$el.find('.modal-body').html(ich.resource_detail_modal(this.model.attributes));

			this.$el.find('.modal-title').text('VM Details: ' + this.model.attributes.name);

			if(this.model.attributes.status === 'on') {
				this.$el.find('#power_on_vm').hide();
				this.$el.find('#power_off_vm').show();
			} else {
				this.$el.find('#power_off_vm').hide();
				this.$el.find('#power_on_vm').show();
			}

			$('.disk-hidden').hide();
			
			this.setupValidation();

			var $table = $('#vm_disk_list');

			$table.dataTable({
				"bJQueryUI": true,
				"bProcessing": true,
				"bDestroy": true,
				"bSort" : false,
				"bFilter" : false
			});

			this.model.loadNetwork(this.vmOptions);
			this.model.loadDisks(this.vmOptions);

			$table.dataTable().fnProcessingIndicator(true);

			this.render();
		},

		setupValidation : function () {

			this.$el.on('change', '#memory', function ( e ) {
				var val = parseInt($(this).val(), 10);
				if(isNaN(val)) {
					e.preventDefault();
					return;
				}
			});

			this.$el.on('change', '#memory', function ( e ) {
				var val = parseInt($(this).val(), 10);
				var rem = val % 4;

				if(rem !== 0) {
					var correctedValue;
					if(rem <=  2) {
						correctedValue = val - rem;
					} else {
						correctedValue = val + 4 - rem;
					}

					$(this).val(correctedValue);
				}
			});
		},

		refreshNetwork : function ( network ) {
			this.network = network;

			if(!ich.templates.vm_network) {
				ich.grabTemplates();
			}

			$('#vm_network_tab').html(ich.vm_network(network));
		},

		refreshDisks : function ( disks ) {
			this.disks = disks;

			var $table = $('#vm_disk_list');

			$table.dataTable().fnClearTable();
			$.each(disks, function () {
				$table.dataTable().fnAddData([this.name, this.capacity.toString()]);
			});

			$table.fnProcessingIndicator(false);
		},

		createDisk : function () {
			$('#create_disk').hide();
			$('.disk-hidden').show();
		},

		createDiskSubmit : function () {
			var diskOptions = _.extend(this.vmOptions, {
				size : $('#new_disk_size').val(),
				success: function () {
					$('#new_disk_size').val('');
				}
			});

			this.model.createDisk(diskOptions);

			var $diskPlaceholder = $('<tr><td>Creating..</td><td>' + $('#new_disk_size').val() + '</td></tr>');

			$('.disk-hidden').hide();
			$('#create_disk').show();
			$('#vm_disk_list').find('tbody').append($diskPlaceholder);
		},

		powerOff : function () {
			this.model.powerOff(this.vmOptions);
		},

		powerOn : function () {
			this.model.powerOn(this.vmOptions);
		},

		modifyVm : function () {

			var options = {
				vdc_id : this.vdc,
				vapp_id : this.vapp,
				vm_id : this.model.attributes.id,
				data : {
					cred_id : this.credentialId
				}
			};

			var cpus = $('#number_of_cpus').val();
			var memory = $('#memory').val();
			if(cpus) {
				options.data.cpu = parseInt(cpus, 10);
			}
			if(memory) {
				options.data.memory = parseInt(memory, 10);
			}
			this.model.modify(options);
		},

		updateNetwork : function () {
			var options = {};
			$('[id^="network_"]').each(function () {
				var prop = $(this).attr('name')
					, val = $(this).val();

				options[prop] = $(this).val();
			});

			options = _.extend(options, this.vmOptions);

			this.model.updateNetwork(options);
		}
	});

	return VCloudVmsAppView;
});