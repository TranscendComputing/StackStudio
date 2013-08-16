/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true */
define([
        'models/resource/resourceModel',
        'common'
], function( ResourceModel, Common ) {
    'use strict';

    var ReservedInstance = ResourceModel.extend({

        defaults: {
            reservedInstancesId: '',
            instanceType: '',
            availabilityZone: '',
            duration: '',
            fixedPrice: '',
            usagePrice: '',
            instanceCount: '',
            productDescription: '',
            start: '',
            state: ''
        },

        create: function(options, credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/compute/reserved_instances?T&cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", options, "reservedInstancesAppRefresh");
        }
        
    });

    return ReservedInstance;
});
