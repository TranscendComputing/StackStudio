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
        'models/resource/resourceModel',
        'common'
], function( $, Backbone, ResourceModel, Common ) {
    'use strict';

    var RecordSet = ResourceModel.extend({

        defaults: {
            ResourceRecords: [],
            Name: '',
            Type: '',
            TTL: ''
        },

        get: function(attr) {
            if(typeof this[attr] === 'function') {
                var attribute = this[attr]();
                return attribute;
            }
            
            return Backbone.Model.prototype.get.call(this, attr);
        },
        
        ResourceRecords: function() {
            var resourceRecords = "";
            $.each(this.attributes.ResourceRecords, function(index, record) {
                if(index === 0) {
                    resourceRecords = record;
                }else {
                    resourceRecords = resourceRecords + "<br />" + record;
                }
            });
            return resourceRecords;
        },

        change: function(options, credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/dns/hosted_zones/" + options["hosted_zone_id"] + "/record_sets/change?_method=PUT&cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", {"record_set": options}, "recordSetRefresh");
        }
    });

    return RecordSet;
});
