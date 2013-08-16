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
/*global define:true console:true alert:true*/
define([
        'jquery',
        'underscore',
        'backbone',
        'text!templates/errorDialogTemplate.html'
], function( $, _, Backbone, errorDialogTemplate) {

    var ErrorDialogView = Backbone.View.extend({
        
        tagName: "div",
        
        events: {
            "dialogclose": "close"
        },

        initialize: function(options) {
            var compiledTemplate = _.template(errorDialogTemplate);
            this.$el.html(compiledTemplate);
            var errorDialogView = this;
            var title, message;
            if(options.title) {
                title = options.title;
            }else {
                title = "Error";
            }
            
            if(options.message) {
                try {
                    var messageObject = JSON.parse(options.message);
                    message = messageObject["error"]["message"];
                }catch(error) {
                    message = options.message;
                }
            }else {
                message = "Invalid Request.";
            } 

            this.$el.dialog({
                title: title,
                autoOpen: true,
                width:300,
                minHeight: 150,
                resizable: false,
                modal: true,
                buttons: [
                    {
                        text: "Ok",
                        click: function() {
                            errorDialogView.ok();
                        }
                    }
                ]
            });
            $("#message").text(message);
        },
        
        ok: function() {
            this.$el.dialog('close');
        },
        
        close: function() {
            this.$el.remove();
        }
    });
    
    return ErrorDialogView;
});
