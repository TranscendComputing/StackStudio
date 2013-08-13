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
        'underscore',
        'backbone',
        'views/dialogView',
        'text!templates/aws/notification/awsTopicDisplayNameEditTemplate.html',
        'common'
        
], function( $, _, Backbone, DialogView, editTopicDisplayNameTemplate, Common ) {
    
    var EditDisplayNameView = DialogView.extend({

        template: _.template(editTopicDisplayNameTemplate),

        credentialId: undefined,

        region: undefined,

        topic: undefined,

        events: {
            "dialogclose": "close"
        },

        initialize: function(options) {
            this.credentialId = options.cred_id;
            this.region = options.region;
            this.topic = options.topic;
        },

        render: function() {
            var editView = this;
            this.$el.html(this.template);

            this.$el.dialog({
                autoOpen: true,
                title: "Edit Display Name",
                width: 550,
                minHeight: 150,
                resizable: false,
                modal: true,
                buttons: {
                    Save: function () {
                        editView.save();
                    },
                    Cancel: function() {
                        editView.cancel();
                    }
                }
            });
        },
        
        save: function() {
            var options = {"name": "DisplayName"};
            if($("#topic_display_name_input").val() !== "") {
                options["value"] = $("#topic_display_name_input").val();
                this.topic.editDisplayName(options, this.credentialId, this.region);
                this.$el.dialog('close');
            }
        }
    });
    
    return EditDisplayNameView;
});
