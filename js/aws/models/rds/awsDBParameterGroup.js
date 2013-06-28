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

    var DBParameterGroup = ResourceModel.extend({

        defaults: {
            id: '',
            family: '',
            description: ''
        }
        ,
        create: function(options, credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/rds/parameter_groups?cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", {"parameter_group": options}, "parameterGroupAppRefresh");
        },

        destroy: function(credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/rds/parameter_groups/" + this.attributes.id + "?_method=DELETE&cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", undefined, "parameterGroupAppRefresh");
        },
        
        getParameters: function(credentialId, region){
            
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/rds/parameter_groups/describe/" + this.attributes.id + "?_method=POST&cred_id=" + credentialId + "&region=" + region;
            var options = {"options":{}};
            
            $.ajax({
                url: url,
                type: "POST",
                contentType: 'application/x-www-form-urlencoded',
                dataType: 'json',
                data: JSON.stringify(options),
                //data: {"options":{}},
                success: function(data) {
                    //alert(data.data.body.DescribeDBParametersResult.Parameters);
                    Common.vent.trigger("describeParameters", data.data.body.DescribeDBParametersResult.Parameters);
                },
                error: function(jqXHR) {
                    Common.errorDialog(jqXHR.statusText, jqXHR.responseText);
                }
            });
            
            
        }
    });

    return DBParameterGroup;
});
