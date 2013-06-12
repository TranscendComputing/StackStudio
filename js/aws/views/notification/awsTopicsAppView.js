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
        'views/resource/resourceAppView',
        'text!templates/aws/notification/awsTopicAppTemplate.html',
        '/js/aws/models/notification/awsTopic.js',
        '/js/aws/collections/notification/awsTopics.js',
        '/js/aws/views/notification/awsTopicsCreateView.js',
        'icanhaz',
        'common'
], function( $, _, Backbone, ResourceAppView, awsTopicAppTemplate, Topic, Topics, AwsTopicCreate, ich, Common ) {
    'use strict';

    var AwsTopicsAppView = ResourceAppView.extend({

        template: _.template(awsTopicAppTemplate),

        modelStringIdentifier: "id",

        columns: ["Name", "id"],
        
        idColumnNumber: 1,
        
        model: Topic,
        
        collectionType: Topics,

        type: "notification",
        
        subtype: "topics",

        CreateView: AwsTopicCreate,
        
        events: {
            'click .create_button': 'createNew',
            'click #action_menu ul li': 'performAction',
            'click #resource_table tr': "clickOne",
            'click #subscription_details' : 'refreshSubscriptionsTab'
        },

        initialize: function(options) {
            if(options.cred_id) {
                this.credentialId = options.cred_id;
            }
            if(options.region) {
                this.region = options.region;
            }
            this.render();
            
            var topicApp = this;
            Common.vent.on("topicAppRefresh", function() {
                topicApp.render();
            });
        },

        toggleActions: function(e) {
            //Disable any needed actions
        },
        
        performAction: function(event) {
            var topic = this.collection.get(this.selectedId);
            
            switch(event.target.text)
            {
                case "Publish to this Topic":
                    break;
                case "Delete Topic":
                    topic.destroy(this.credentialId, this.region);
                    break;
                case "Edit Topic Display Name":
                    break;
                case "View/Edit Topic Policy":
                    break;
                case "View/Edit Topic Delivery Policy":
                    break;
            }
        },

        refreshSubscriptionsTab: function() {
            $("#subscriptions_tab_content").empty();
            $("#subscriptions_tab_content").append( "<button id='create_subscription_button'>Create Subscription</button>" +
                                                    "<button id='delete_subscription_button' disabled>Delete Subscription</button><br /><br />" +
                                                    "<table id='subscriptions_table' class='full_width'>" +
                                                        "<thead>" +
                                                            "<tr>" +
                                                                "<th>Subscription ID</th><th>Protocol</th><th>Endpoint</th><th>Subscriber</th>" +
                                                            "</tr>" +
                                                        "</thead>" +
                                                        "<tbody></tbody><tfoot></tfoot>" +
                                                    "</table>");
            $("#subscriptions_table").dataTable({
                "bJQueryUI": true,
                "sDom": 't'
            });
            $("#create_subscription_button").button();
            $("#delete_subscription_button").button();
            //get subscriptions
        }
    });
    
    return AwsTopicsAppView;
});
