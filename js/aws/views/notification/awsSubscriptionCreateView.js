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
        'text!templates/aws/notification/awsSubscriptionCreateTemplate.html',
        '/js/aws/models/notification/awsSubscription.js',
        'common'
        
], function( $, _, Backbone, DialogView, subscriptionCreateTemplate, Subscription, Common ) {
    
    var SubscriptionCreateView = DialogView.extend({

        template: _.template(subscriptionCreateTemplate),

        credentialId: undefined,

        region: undefined,

        topic: undefined,

        subscription: new Subscription(),

        events: {
            "dialogclose": "close"
        },

        initialize: function(options) {
            this.credentialId = options.cred_id;
            this.region = options.region;
            this.topic = options.topic;
        },

        render: function() {
            var createView = this;
            this.$el.html(this.template);

            this.$el.dialog({
                autoOpen: true,
                title: "Create Subscription",
                width:450,
                minHeight: 150,
                resizable: false,
                modal: true,
                buttons: {
                    Create: function () {
                        createView.create();
                    },
                    Cancel: function() {
                        createView.cancel();
                    }
                }
            });

            var topicSplitArray = this.topic.split(":");
            var topicName = topicSplitArray[topicSplitArray.length-1];
            $("#topic_name_output").html(topicName);

            $("#protocol_select").change(function() {
                switch($("#protocol_select").val()) {
                    case "email":
                        $("#endpoint_message").html("e.g. user@domain.com");
                        break;
                    case "email-json":
                        $("#endpoint_message").html("e.g. user@domain.com");
                        break;
                    case "http":
                        $("#endpoint_message").html("e.g. http://company.com");
                        break;
                    case "https":
                        $("#endpoint_message").html("e.g. https://company.com");
                        break;
                    case "sms":
                        $("#endpoint_message").html("e.g. 1-206-555-6423");
                        break;
                    case "sqs":
                        $("#endpoint_message").html("e.g. arn:aws:sqs:us-east-1:555555555555:my-queue");
                        break;
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
        
        create: function() {
            var createView = this;
            var newSubscription = this.subscription;
            var options = {};
            if($("#endpoint_input").val() !== "") {
                this.displayValid(true, "#endpoint_input");
                options["endpoint"] = $("#endpoint_input").val();
                options["protocol"] = $("#protocol_select").val();
                newSubscription.create(this.topic, options, this.credentialId, this.region);
                this.$el.dialog('close');
            }else {
                this.displayValid(false, "#endpoint_input");
            }
        }
    });
    
    return SubscriptionCreateView;
});
