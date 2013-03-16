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
        'common'
], function( $, Backbone, Common ) {
    'use strict';

    var RecordSet = Backbone.Model.extend({

        /** Default attributes for record set */
        defaults: {
            ResourceRecords: [],
            Name: '',
            Type: '',
            TTL: ''
        },

        get: function(attr) {
            if(typeof this[attr] == 'function') {
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

        change: function(options, credentialId) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/dns/record_sets/change?_method=PUT&cred_id=" + credentialId;
            this.sendPostAction(url, options);
        },

        sendPostAction: function(url, options) {
            var recordSet = {"record_set": options};
            $.ajax({
                url: url,
                type: 'POST',
                contentType: 'application/x-www-form-urlencoded',
                dataType: 'json',
                data: JSON.stringify(recordSet),
                success: function(data) {
                    Common.vent.trigger("recordSetRefresh");
                },
                error: function(jqXHR) {
                    Common.errorDialog(jqXHR.statusText, jqXHR.responseText);
                }
            }); 
        }
    });

    return RecordSet;
});
