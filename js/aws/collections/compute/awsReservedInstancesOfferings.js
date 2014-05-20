/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true */
define([
        'jquery',
        'backbone',
        'aws/models/compute/awsReservedInstancesOffering',
        'common'
], function( $, Backbone, ReservedInstancesOffering, Common ) {
    'use strict';

    var ReservedInstancesOfferingList = Backbone.Collection.extend({

        model: ReservedInstancesOffering,

        url: Common.apiUrl + '/stackstudio/v1/cloud_management/aws/compute/reserved_instances/describe_offerings',

        purchase: function() {
            var col = this;
            var url = Common.apiUrl + '/stackstudio/v1/cloud_management/aws/compute/reserved_instances?cred_id=' + this.credentialId + '&region=' + this.region;
            var count;
            col.each(function(m){
                if(m.attributes.count)
                {
                    count = m.attributes.count;
                }else{
                    count = 1;
                }
                $.ajax({
                    url: url,
                    type: 'POST',
                    contentType: 'application/x-www-form-urlencoded',
                    dataType: 'json',
                    data: JSON.stringify({reserved_instances_offering_id: m.id, instance_count: count}),
                    success: function(data) {
                        console.log(data.body);
                    },
                    error: function(jqXHR) {
                        Common.errorDialog(jqXHR.statusText, jqXHR.responseText);
                    }
                }); 
            }, col);
        }
    });
    
    return ReservedInstancesOfferingList;

});
