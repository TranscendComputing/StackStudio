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
        'jquery',
        'backbone',
        'common'
], function( $, Backbone, Common ) {
    'use strict';

    var resourceModel = Backbone.Model.extend({

        sendAjaxAction: function(url, type, options, triggerString) {

            /*
            
            TODO: Incorporate this example to wrap our models ajax call to create messages
            
            Messenger.options = {
                extraClasses: 'messenger-fixed messenger-on-bottom messenger-on-left'
            };
            new Messenger().run({
                successMessage: roleModel.get("name") + " role added for " + userModel.get("name") + " on " + this.get("name"),
                progressMessage: "Adding " + roleModel.get("name") + " role to " + userModel.get("name") + " on " + this.get("name"),
                errorMessage: "Error adding " + roleModel.get("name") + " role to " + userModel.get("name") + " on " + this.get("name"),
                showCloseButton: true
            },{
                url: this.url() + url,
                type: 'POST',
                contentType: 'application/x-www-form-urlencoded',
                dataType: 'json',
                data: JSON.stringify({role_id: roleModel.id}),
                success: function(data) {
                    Common.vent.trigger(trigger);
                }
            }, this);
            */
            if(options) {
                $.ajax({
                    url: url,
                    type: type,
                    contentType: 'application/x-www-form-urlencoded',
                    dataType: 'json',
                    data: JSON.stringify(options),
                    success: function(data) {
                        Common.vent.trigger(triggerString, data);
                    },
                    error: function(jqXHR) {
                        Common.errorDialog(jqXHR.statusText, jqXHR.responseText);
                    }
                }); 
            }else {
                $.ajax({
                    url: url,
                    type: type,
                    contentType: 'application/x-www-form-urlencoded',
                    success: function(data) {
                        Common.vent.trigger(triggerString, data);
                    },
                    error: function(jqXHR) {
                        Common.errorDialog(jqXHR.statusText, jqXHR.responseText);
                    }
                });
            }
        }
    });

    return resourceModel;
});
