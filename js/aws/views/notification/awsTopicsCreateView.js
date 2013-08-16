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
        'text!templates/aws/notification/awsTopicCreateTemplate.html',
        '/js/aws/models/notification/awsTopic.js',
        'common'
        
], function( $, _, Backbone, DialogView, topicCreateTemplate, Topic, Common ) {
    
    var TopicCreateView = DialogView.extend({

        template: _.template(topicCreateTemplate),

        credentialId: undefined,

        region: undefined,
        
        topic: new Topic(),

        events: {
            "dialogclose": "close"
        },

        initialize: function(options) {
            this.credentialId = options.cred_id;
            this.region = options.region;
        },

        render: function() {
            var createView = this;
            this.$el.html(this.template);

            this.$el.dialog({
                autoOpen: true,
                title: "Create Topic",
                width:350,
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
            var newTopic = this.topic;
            var options = {};
            if($("#topic_name_input").val() !== "") {
                this.displayValid(true, "#topic_name_input");
                options["name"] = $("#topic_name_input").val();
                newTopic.create(options, this.credentialId, this.region);
                this.$el.dialog('close');
            }else {
                this.displayValid(false, "#topic_name_input");
            }
        }
    });
    
    return TopicCreateView;
});
