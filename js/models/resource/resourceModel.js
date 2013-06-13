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
