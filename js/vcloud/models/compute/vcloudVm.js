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
	'common',
	'models/resource/resourceModel',
	'mixins'
], function ( $, _, Backbone, Common, ResourceModel ) {
	var VCloudVm = ResourceModel.extend({
		
		defaults : {
			cred_id : ''
		},

		defaultErrorHandler : function ( err ) {
			var status;
			var message;
			if(!err) {
				status = "Unknown";
				message = "An unknown error has occurred.";
				return Common.errorDialog(status, message);
			}

			console.log("AJAX Error: ", err);

			status = err.status;
			message = (typeof err === 'string') ? err : err.responseText;
			if(typeof message !== 'string') {
				message = "An unknown error has occurred.";
			}
			return Common.errorDialog(status + ' Error', message);
		},


		initialize : function ( options ) {
			this.vdc_id = this.collection.options.vdc_id;
			this.vapp_id = this.collection.options.vapp_id;
			this.cred_id = this.collection.options.cred_id;

			this.baseUrl = Common.apiUrl + '/stackstudio/v1/cloud_management/vcloud/compute/data_centers/' + this.vdc_id + '/vapps/' + this.vapp_id + '/vms/' + this.attributes.id;
		},

		powerOff : function ( options ) {
			var ajaxOptions = {
				type : 'POST',
				url : Common.apiUrl + '/stackstudio/v1/cloud_management/vcloud/compute/data_centers/' + options.vdc_id + '/vapps/' + options.vapp_id + '/vms/' + options.vm_id,
				data : {
					status : 'off',
					cred_id : options.cred_id
				},
				success : function ( vm ) {
					Common.vent.trigger('vmAppRefresh', vm);
				},
				error : options.error || this.defaultErrorHandler
			};

			$.ajax(ajaxOptions);
		},

		powerOn : function ( options ) {
			var ajaxOptions = {
				type : 'POST',
				url : Common.apiUrl + '/stackstudio/v1/cloud_management/vcloud/compute/data_centers/' + options.vdc_id + '/vapps/' + options.vapp_id + '/vms/' + options.vm_id,
				data : {
					status : 'on',
					cred_id : options.cred_id
				},
				success : function ( vm ) {
					Common.vent.trigger('vmAppRefresh', vm);
				},
				error : options.error || this.defaultErrorHandler
			};

			$.ajax(ajaxOptions);
		},

		modify : function ( options ) {
			var mdl = this;
			var ajaxOptions = {
				type : 'POST',
				url : Common.apiUrl + '/stackstudio/v1/cloud_management/vcloud/compute/data_centers/' + options.vdc_id + '/vapps/' + options.vapp_id + '/vms/' + options.vm_id,
				data : options.data,
				success : options.success || function ( vm ) {
					Common.vent.trigger('vmAppRefresh', vm);
				},
				error : options.error || function ( err ) {
					if(!(err && err.responseText)) {
						return mdl.defaultErrorHandler(err);
					}
					var message;
					if(err.responseText.indexOf('multiple of') > -1) {
						message = "The virtual machine memory size must be a multiple of 4 MB.";
					} else { // if (err.responseText.indexOf('support') > -1) {
						message = "Error modifying VM. Make sure that the VM is powered on and that both the the vCloud VM configuration and the VM operating system itself support this action.";
					}
					Common.errorDialog(err.status + ' Error', message);
				}
			};
			
			$.ajax(ajaxOptions);
		},

		loadNetwork : function ( options ) {
			var ajaxOptions = {
				type : 'GET',
				url : Common.apiUrl + '/stackstudio/v1/cloud_management/vcloud/compute/data_centers/' + options.vdc_id + '/vapps/' + options.vapp_id + '/vms/' + options.vm_id + '/network',
				data : {
					cred_id : options.cred_id
				},
				success : function ( vm ) {
					Common.vent.trigger('vmAppRefresh', vm);
				},
				error : options.error || function ( err ) {
					Common.vent.trigger('vmNetworkLoadError', err);
				}
			};

			$.ajax(ajaxOptions);
		},

		updateNetwork : function ( options ) {
			var refinedOptions = _.refine(options);
			var ajaxOptions = {
				type : 'POST',
				url : Common.apiUrl + '/stackstudio/v1/cloud_management/vcloud/compute/data_centers/' + options.vdc_id + '/vapps/' + options.vapp_id + '/vms/' + options.vm_id + '/network',
				data : refinedOptions,
				success : function ( network ) {
					Common.vent.trigger('networkRefresh', network);
				},
				error : options.error || this.defaultErrorHandler
			};

			$.ajax(ajaxOptions);
		},

		loadDisks : function ( options ) {
			var ajaxOptions = {
				type : 'GET',
				url : Common.apiUrl + '/stackstudio/v1/cloud_management/vcloud/compute/data_centers/' + options.vdc_id + '/vapps/' + options.vapp_id + '/vms/' + options.vm_id + '/disks',
				data : {
					cred_id : options.cred_id
				},
				success : function ( disks ) {
					Common.vent.trigger('disksLoaded', disks);
				},
				error : options.error || function ( err ) {
					Common.vent.trigger('vmDiskLoadError', err);
				}
			};
			$.ajax(ajaxOptions);
		},

		createDisk : function ( options ) {
			var ajaxOptions = {
				type : 'POST',
				url : Common.apiUrl + '/stackstudio/v1/cloud_management/vcloud/compute/data_centers/' + options.vdc_id + '/vapps/' + options.vapp_id + '/vms/' + options.vm_id + '/disks',
				data : {
					cred_id : options.cred_id,
					size : options.size
				},
				success : options.success,
				error : options.error || this.defaultErrorHandler
			};

			$.ajax(ajaxOptions);
		}
	});

	return VCloudVm;
});