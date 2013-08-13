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
/*global define:true console:true requirejs:true require:true*/
define([
        'jquery',
        'underscore',
        'backbone',
        'icanhaz',
        'text!templates/notificationDialogTemplate.html',
        'jquery-plugins',
        'jquery-ui-plugins'
], function( $, _, Backbone, ich, notificationDialogTemplate) {

    var NotificationDialogView = Backbone.View.extend({
        /** @type {Template} HTML template to generate view from */
        template: _.template(notificationDialogTemplate),
        /** Constructor method for current view */
        initialize: function(options) {
            this.dialog_title = options.dialog_title;
            this.message = options.message;
            this.render();
        },
        /** Add all of my own html elements */
        render: function () {
            //Render my template
            ich.addTemplate("dialog_message", this.template());
            var dialog =  ich.dialog_message({title: this.dialog_title, message: this.message});
            //Render my template
            this.$el.html(dialog);
            this.$el.dialog({
                resizable: false,
                modal: true,
                buttons: {
                    Ok: function () {
                        $(this).dialog("close");
                    }
                }
            });            
        }    
    });

    return NotificationDialogView;
});
