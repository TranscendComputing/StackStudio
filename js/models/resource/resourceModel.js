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
        'common',
        'messenger'
], function( $, Backbone, Common, Messenger) {
    'use strict';

    var resourceModel = Backbone.Model.extend({

        sendAjaxAction: function(url, type, options, triggerString, messengerString) {

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
                return $.ajax({
                    url: url,
                    type: type,
                    contentType: 'application/x-www-form-urlencoded',
                    dataType: 'json',
                    data: JSON.stringify(options),
                    success: function(data) {
                        if(messengerString){
                            new Messenger().post({type:"success", message:messengerString});
                        }
                        Common.vent.trigger(triggerString, data);
                    },
                    error: function(jqXHR) {
                        Common.errorDialog(jqXHR.statusText, jqXHR.responseText);
                    }
                });
            }else {
                return $.ajax({
                    url: url,
                    type: type,
                    contentType: 'application/x-www-form-urlencoded',
                    success: function(data) {
                        if(messengerString){
                            new Messenger().post({type:"success", message:messengerString});
                        }
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
