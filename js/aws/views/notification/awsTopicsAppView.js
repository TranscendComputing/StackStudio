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
            case "Create New Subscription":
                break;
            case "Delete Subscriptions":
                break;
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
        }
    });
    
    return AwsTopicsAppView;
});
