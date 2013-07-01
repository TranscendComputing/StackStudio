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

    var Application = ResourceModel.extend({
        
        idAttribute: "name",
        
        defaults: {
            name: '',
            description: '',
            created_at: '',
            updated_at: '',
            version_names: [],
            template_names: []
        },

        create: function(options, credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/beanstalk/applications?cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", {"application": options}, "applicationAppRefresh");
        },

        destroy: function(credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/beanstalk/applications/" + this.attributes.id + "?_method=DELETE&cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", undefined, "applicationAppRefresh");
        }
    });

    return Application;
});
