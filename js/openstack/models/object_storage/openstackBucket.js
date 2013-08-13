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

    // Base Bucket Model
    // ----------

    /**
     *
     * @name Bucket
     * @constructor
     * @category ObjectStorage
     * @param {Object} initialization object.
     * @returns {Object} Returns a Bucket instance.
     */
    var Bucket = Backbone.Model.extend({

        idAttribute: "key",

        parse: function(data) {
            var size = (data.bytes / 1000).toFixed(2);
            data.size = data.size > 1000 ? (size / 1000).toFixed(2).toString() + " MB" : size.toString() + " KB";
            return data;
        },
		
        create: function(options, credentialId, region) {
            var url = "?cred_id=" + credentialId + "&region=" + region;
            this.sendPostAction(url, {directory: this.attributes});
        },
        
        destroy: function(credentialId, region) {
            var url = "?_method=DELETE&cred_id=" + credentialId + "&region=" + region;
            this.sendPostAction(url);
        },
        
        sendPostAction: function(url, options, trigger) {
            //Set default values for options and trigger if nothing is passed
            options = typeof options !== 'undefined' ? options : {};
            trigger = typeof trigger !== 'undefined' ? trigger : "objectStorageAppRefresh";
            $.ajax({
                url: this.url() + url,
                type: 'POST',
                contentType: 'application/x-www-form-urlencoded',
                dataType: 'json',
                data: JSON.stringify(options),
                success: function(data) {
                    Common.vent.trigger(trigger);
                },
                error: function(jqXHR) {
                    Common.errorDialog(jqXHR.statusText, jqXHR.responseText);
                }
            }); 
        }
    });

    return Bucket;
});
