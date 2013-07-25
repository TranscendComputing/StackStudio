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
        'text!templates/aws/notification/awsPublishToTopicTemplate.html',
        'common'
        
], function( $, _, Backbone, DialogView, publishToTopicTemplate, Common ) {
    
    var PublishToTopicView = DialogView.extend({

        template: _.template(publishToTopicTemplate),

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
            var publishView = this;
            this.$el.html(this.template);

            this.$el.dialog({
                autoOpen: true,
                title: "Publish",
                width: 550,
                minHeight: 150,
                resizable: false,
                modal: true,
                buttons: {
                    Publish: function () {
                        publishView.publish();
                    },
                    Cancel: function() {
                        publishView.cancel();
                    }
                }
            });

            if(this.topic) {
                var topicSplitArray = this.topic.attributes.TopicArn.split(":");
                var topicName = topicSplitArray[topicSplitArray.length-1];
                $("#topic_name_output").html(topicName);
            }

            $("#same_message_radio, #different_message_radio").change( function () {
                if($("#same_message_radio").is(":checked")) {
                    $("#message_input").val("");
                }else {
                    $("#message_input").val('{\n' +
                        '\t"default": "<enter your message here>",\n' +
                        '\t"email": "<enter your message here>",\n' +
                        '\t"sqs": "<enter your message here>",\n' +
                        '\t"sms": "<enter your message here>",\n' +
                        '\t"http": "<enter your message here>",\n' +
                        '\t"https": "<enter your message here>"\n' +
                     '}');
                }
            });
        },

        displayValid: function(valid, selector) {
            if(valid) {
                $(selector).css("border-color", "");
            }else{
                $(selector).css("border-color", "#FF0000");
            }
        },
        
        publish: function() {
            var options = {};
            options["message"] = $("#message_input").val();
            if($("#subject_input").val() !== "") {
                options["options"] = {};
                options["options"]["Subject"] = $("#protocol_select").val();
            }
            if($("#different_message_radio").is(":checked")) {
                if(!options["options"]) {
                    options["options"] = {};
                }
                options["options"]["MessageStructure"] = "json";
            }
            this.topic.publish(options, this.credentialId, this.region);
            this.$el.dialog('close');
        }
    });
    
    return PublishToTopicView;
});
