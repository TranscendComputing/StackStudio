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
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/beanstalk/applications/" + this.attributes.name + "?_method=DELETE&cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", undefined, "applicationAppRefresh");
        },
        
        getEnvironments: function(credentialId, region){
            
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/beanstalk/applications/environments?_method=POST&cred_id=" + credentialId + "&region=" + region;
            var options = {"options":{"ApplicationName":this.attributes.name}};
            
            //alert(options);
            
            $.ajax({
                url: url,
                type: "POST",
                contentType: 'application/x-www-form-urlencoded',
                dataType: 'json',
                data: JSON.stringify(options),
                //data: {"options":{}},
                success: function(data) {
                    //data.data.body.DescribeCacheParametersResult.Parameters
                    Common.vent.trigger("environmentsRefresh", data);
                },
                error: function(jqXHR) {
                    Common.errorDialog(jqXHR.statusText, jqXHR.responseText);
                }
            });
            
            
        },
        
        getVersions: function(credentialId, region){
            
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/beanstalk/applications/versions?_method=POST&cred_id=" + credentialId + "&region=" + region;
            var options = {"options":{"ApplicationName":this.attributes.name}};
            
            //alert(options);
            
            $.ajax({
                url: url,
                type: "POST",
                contentType: 'application/x-www-form-urlencoded',
                dataType: 'json',
                data: JSON.stringify(options),
                //data: {"options":{}},
                success: function(data) {
                    //data.data.body.DescribeCacheParametersResult.Parameters
                    Common.vent.trigger("versionsRefresh", data);
                },
                error: function(jqXHR) {
                    Common.errorDialog(jqXHR.statusText, jqXHR.responseText);
                }
            });
            
            
        }
    });

    return Application;
});
