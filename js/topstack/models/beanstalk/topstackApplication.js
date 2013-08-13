/*!
 * (c) Copyright 2012-2013 Transcend Computing, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the License);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an AS IS BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/topstack/beanstalk/applications?cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", {"application": options}, "applicationAppRefresh");
        },

        destroy: function(credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/topstack/beanstalk/applications/" + this.attributes.name + "?_method=DELETE&cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", undefined, "applicationAppRefresh");
        },
        
        destroyEnvironment: function(eid,credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/topstack/beanstalk/applications/environments/" + eid + "?_method=DELETE&cred_id=" + credentialId + "&region=" + region;
            //debugger
            this.sendAjaxAction(url, "POST", undefined, "applicationAppRefresh");
        },
        
        destroyVersion: function(vid,credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/topstack/beanstalk/applications/"+this.attributes.name+"/versions/" + vid + "?_method=DELETE&cred_id=" + credentialId + "&region=" + region;
            //debugger
            this.sendAjaxAction(url, "POST", undefined, "applicationAppRefresh");
        },
        
        getEnvironments: function(credentialId, region){
            
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/topstack/beanstalk/applications/environments?_method=POST&cred_id=" + credentialId + "&region=" + region;
            var options = {"options":{"ApplicationName":this.attributes.name,"IncludeDeleted":false}};
            
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
        
        getEvents: function(credentialId, region){
            
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/topstack/beanstalk/applications/events?_method=POST&cred_id=" + credentialId + "&region=" + region;
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
                    Common.vent.trigger("eventsRefresh", data);
                },
                error: function(jqXHR) {
                    Common.errorDialog(jqXHR.statusText, jqXHR.responseText);
                }
            });
            
            
        },
        
        getVersions: function(credentialId, region){
            
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/topstack/beanstalk/applications/versions?_method=POST&cred_id=" + credentialId + "&region=" + region;
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
            
            
        },
        
        createVersion: function(options,credentialId, region){
            
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/topstack/beanstalk/applications/versions/create?_method=POST&cred_id=" + credentialId + "&region=" + region;
            
            var version = {"version":options};
            
            //debugger
            
            $.ajax({
                url: url,
                type: "POST",
                contentType: 'application/x-www-form-urlencoded',
                dataType: 'json',
                data: JSON.stringify(version),
                //data: {"options":{}},
                success: function(data) {
                    //data.data.body.DescribeCacheParametersResult.Parameters
                    Common.vent.trigger("applicationAppRefresh", data);
                },
                error: function(jqXHR) {
                    Common.errorDialog(jqXHR.statusText, jqXHR.responseText);
                }
            });
            
            
        },
        
        createEnvironment: function(options,credentialId, region){
            
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/topstack/beanstalk/applications/environments/create?_method=POST&cred_id=" + credentialId + "&region=" + region;
            
            var environment = {"environment":options};
            
            //debugger
            
            $.ajax({
                url: url,
                type: "POST",
                contentType: 'application/x-www-form-urlencoded',
                dataType: 'json',
                data: JSON.stringify(environment),
                //data: {"options":{}},
                success: function(data) {
                    //data.data.body.DescribeCacheParametersResult.Parameters
                    Common.vent.trigger("applicationAppRefresh", data);
                },
                error: function(jqXHR) {
                    Common.errorDialog(jqXHR.statusText, jqXHR.responseText);
                }
            });
            
            
        },
        
        updateEnvironment: function(options,credentialId, region){
            
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/topstack/beanstalk/applications/environments/update?_method=POST&cred_id=" + credentialId + "&region=" + region;
            
            var environment = {"environment":options};
            
            //debugger
            
            $.ajax({
                url: url,
                type: "POST",
                contentType: 'application/x-www-form-urlencoded',
                dataType: 'json',
                data: JSON.stringify(environment),
                //data: {"options":{}},
                success: function(data) {
                    //data.data.body.DescribeCacheParametersResult.Parameters
                    Common.vent.trigger("applicationAppRefresh", data);
                },
                error: function(jqXHR) {
                    Common.errorDialog(jqXHR.statusText, jqXHR.responseText);
                }
            });
            
            
        },
        
        describeEnv: function(eid,credentialId, region){
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/topstack/beanstalk/applications/environments/" + eid + "?_method=GET&cred_id=" + credentialId + "&region=" + region;
            //debugger
            $.ajax({
                url: url,
                type: "GET",
                contentType: 'application/x-www-form-urlencoded',
                success: function(data) {
                    //data.data.body.DescribeCacheParametersResult.Parameters
                    Common.vent.trigger("envRefresh", data);
                },
                error: function(jqXHR) {
                    Common.errorDialog(jqXHR.statusText, jqXHR.responseText);
                }
            });
        },
        
        describeEnvConfig: function(eid,credentialId, region){
            
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/topstack/beanstalk/applications/environments/config?_method=POST&cred_id=" + credentialId + "&region=" + region;
            var options = {"options":{"ApplicationName":this.attributes.name,"EnvironmentName":eid}};
            
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
                    Common.vent.trigger("configRefresh", data);
                },
                error: function(jqXHR) {
                    Common.errorDialog(jqXHR.statusText, jqXHR.responseText);
                }
            });
            
            
        },
        
    });

    return Application;
});
