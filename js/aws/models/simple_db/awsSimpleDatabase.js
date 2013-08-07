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

    var SimpleDB = ResourceModel.extend({
        idAttribute: 'DomainName',

        defaults: {
            DomainName: '',
            ItemCount: 0,
            ItemNamesSizeBytes: 0,
            AttributeNameCount: 0,
            AttributeNamesSizeBytes: 0,
            AttributeValueCount: 0,
            AttributeValuesSizeBytes: 0,
            Timestamp: '',
            RequestId: '',
            BoxUsage: 0.0
        },

        create: function(options, credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/simple_db/databases?cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", {"simple_db": options}, "simpleDBAppRefresh");
        },

        destroy: function(credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/simple_db/databases/" + this.attributes.DomainName + "?_method=DELETE&cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", undefined, "simpleDBAppRefresh");
        }
    });

    return SimpleDB;
});
