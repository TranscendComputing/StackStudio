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
	'models/resource/resourceModel'
], function ( $, _, Backbone, Common, ResourceModel ) {
	var VCloudVapp = ResourceModel.extend({
		
		defaults : {
			cred_id : ''
		},

    parse : function ( res ) {
      res.status = this.getStatus(res.status);
      return res;
    },

    getStatus : function ( code ) {
      switch(parseInt(code, 10)) {
        case 2:
          return "Deployed";
        case 3:
          return "Suspended";
        case 4: 
          return "Powered On";
        case 8:
          return "Powered Off";
        case 10:
          return "Mixed";
        default:
          return "Unknown";
      }
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

			status = err.status || err.status_code || err.errorCode || err.minorErrorCode || "Unknown";
			message = (typeof err === 'string') ? err : err.responseText || err.message;
			if(typeof message !== 'string') {
				message = "An unknown error has occurred.";
			}
			return Common.errorDialog("Error (" + status + ")", message);
		},

		destroy : function ( options ) {
			$.ajax({
				type: 'POST',
				url : Common.apiUrl + '/stackstudio/v1/cloud_management/vcloud/compute/data_centers/' + options.vdc_id + '/vapps/' + options.vapp_id  + '?_method=DELETE&cred_id=' + options.cred_id,
				success : options.success || function ( result ) {
					console.log(result);
				},
				error : options.error || this.defaultErrorHandler
			});
		},


		createSnapshot : function ( options ) {
			$.ajax({
				type : 'POST',
				url : Common.apiUrl + '/stackstudio/v1/cloud_management/vcloud/compute/data_centers/' + options.vdc_id + '/vapps/' + options.vapp_id + '/snapshot',
				data : {
					cred_id : options.cred_id
				},
				success : options.success || function ( result ) {
					console.log(result);
				},
				error : options.error || this.defaultErrorHandler
			});
		},

		revert : function ( options ) {
			$.ajax({
				type : 'POST',
				url : Common.apiUrl + '/stackstudio/v1/cloud_management/vcloud/compute/data_centers/' + options.vdc_id + '/vapps/' + options.vapp_id + '/revert_to_snapshot',
				data : {
					cred_id : options.cred_id
				},
				success : options.success || function ( result ) {
					console.log(result);
				},
				error : options.error || this.defaultErrorHandler
			});
		},

		removeSnapshots : function ( options ) {
			$.ajax({
				type : 'POST',
				url : Common.apiUrl + '/stackstudio/v1/cloud_management/vcloud/compute/data_centers/' + options.vdc_id + '/vapps/' + options.vapp_id + '/snapshot?_method=DELETE&cred_id=' + options.cred_id,
				data : {
					cred_id : options.cred_id
				},
				success : options.success || function ( result ) {
					console.log(result);
				},
				error : options.error || this.defaultErrorHandler
			});
		},

    powerOff : function ( options ) {
      $.ajax({
        type: 'POST',
        url : Common.apiUrl + '/stackstudio/v1/cloud_management/vcloud/compute/data_centers/' + options.vdc_id + '/vapps/' + options.vapp_id + '/power_off',
        data : {
          cred_id : options.cred_id
        },
        success: options.success || function ( result ) {
          console.log(result);
        },
        error : options.error || this.defaultErrorHandler
      });
    },

    powerOn : function ( options ) {
      $.ajax({
        type: 'POST',
        url : Common.apiUrl + '/stackstudio/v1/cloud_management/vcloud/compute/data_centers/' + options.vdc_id + '/vapps/' + options.vapp_id + '/power_on',
        data : {
          cred_id : options.cred_id
        },
        success: options.success || function ( result ) {
          console.log(result);
        },
        error : options.error || this.defaultErrorHandler
      });
    },

    reboot : function ( options ) {
      $.ajax({
        type: 'POST',
        url : Common.apiUrl + '/stackstudio/v1/cloud_management/vcloud/compute/data_centers/' + options.vdc_id + '/vapps/' + options.vapp_id + '/reboot',
        data : {
          cred_id : options.cred_id
        },
        success: options.success || function ( result ) {
          console.log(result);
        },
        error : options.error || this.defaultErrorHandler
      });
    },

    reset : function ( options ) {
      $.ajax({
        type: 'POST',
        url : Common.apiUrl + '/stackstudio/v1/cloud_management/vcloud/compute/data_centers/' + options.vdc_id + '/vapps/' + options.vapp_id + '/reset',
        data : {
          cred_id : options.cred_id
        },
        success: options.success || function ( result ) {
          console.log(result);
        },
        error : options.error || this.defaultErrorHandler
      });
    },

    suspend : function ( options ) {
      $.ajax({
        type: 'POST',
        url : Common.apiUrl + '/stackstudio/v1/cloud_management/vcloud/compute/data_centers/' + options.vdc_id + '/vapps/' + options.vapp_id + '/suspend',
        data : {
          cred_id : options.cred_id
        },
        success: options.success || function ( result ) {
          console.log(result);
        },
        error : options.error || this.defaultErrorHandler
      });
    },

    clone : function ( options ) {
      $.ajax({
        type: 'POST',
        url : Common.apiUrl + '/stackstudio/v1/cloud_management/vcloud/compute/data_centers/' + options.vdc_id + '/vapps/' + options.vapp_id + '/clone',
        data : {
          cred_id : options.cred_id,
          vapp_name : options.vapp_name,
          vapp_options : options.vapp_options
        },
        success: options.success || function ( result ) {
          console.log(result);
        },
        error : options.error || this.defaultErrorHandler
      });
    }
	});

	return VCloudVapp;
});