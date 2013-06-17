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
        'views/resource/resourceRowView',
        'text!templates/aws/notification/awsTopicAppTemplate.html',
        '/js/aws/models/notification/awsTopic.js',
        '/js/aws/collections/notification/awsTopics.js',
        '/js/aws/collections/notification/awsSubscriptions.js',
        '/js/aws/views/notification/awsTopicsCreateView.js',
        '/js/aws/views/notification/awsPublishToTopicView.js',
        '/js/aws/views/notification/awsTopicDisplayNameEditView.js',
        '/js/aws/views/notification/awsSubscriptionCreateView.js',
        'icanhaz',
        'common'
], function( $, _, Backbone, ResourceAppView, ResourceRowView, awsTopicAppTemplate, Topic, Topics, Subscriptions, AwsTopicCreate, PublishToTopic, EditTopicDisplayName, SuscriptionCreate, ich, Common ) {
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

        subscriptions: undefined,

        selectedSubscription: undefined,
        
        events: {
            'click .create_button': 'createNew',
            'click #action_menu ul li': 'performAction',
            'click #resource_table tr': "clickOne",
            'click #subscription_details' : 'refreshSubscriptionsTab',
            'click #create_subscription_button': 'openCreateSubscriptionDialog',
            'click #subscriptions_table tr': 'selectSubscription',
            'click #delete_subscription_button': 'deleteSubscription'
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

            Common.vent.on("subscriptionRefresh", function() {
                topicApp.refreshSubscriptionsTab();
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
                    var publish = new PublishToTopic({cred_id: this.credentialId, region: this.region, topic: topic});
                    publish.render();
                    break;
                case "Delete Topic":
                    topic.destroy(this.credentialId, this.region);
                    break;
                case "Edit Topic Display Name":
                    var editTopicDisplayName = new EditTopicDisplayName({cred_id: this.credentialId, region: this.region, topic: topic});
                    editTopicDisplayName.render();
                    break;
            }
        },

        refreshSubscriptionsTab: function() {
            $("#subscriptions_tab_content").empty();
            $("#subscriptions_tab_content").append( "<button id='create_subscription_button'>Create Subscription</button>" +
                                                    "<button id='delete_subscription_button'>Delete Subscription</button><br /><br />" +
                                                    "<table id='subscriptions_table' class='full_width'>" +
                                                        "<thead>" +
                                                            "<tr>" +
                                                                "<th>Subscription ID</th><th>Protocol</th><th>Endpoint</th><th>Subscriber</th>" +
                                                            "</tr>" +
                                                        "</thead>" +
                                                        "<tbody></tbody><tfoot></tfoot>" +
                                                    "</table>");
            this.$subscriptionTable = $("#subscriptions_table").dataTable({
                "bJQueryUI": true,
                "sDom": 't'
            });
            $("#create_subscription_button").button();
            $("#delete_subscription_button").button();
            $("#delete_subscription_button").addClass("ui-state-disabled");
            $("#delete_subscription_button").attr("disabled", true);
            this.subscriptions = new Subscriptions({"topic_id": this.selectedId});
            this.subscriptions.on( 'reset', this.addAllSubscriptions, this );
            this.subscriptions.fetch({ data: $.param({ cred_id: this.credentialId, region: this.region}), reset: true});
        },

        addAllSubscriptions: function() {
            $("#subscriptions_table").dataTable().fnClearTable();
            this.subscriptions.each(function(subscription) {
                var view = new ResourceRowView({ tableId: "#subscriptions_table", model: subscription });
                view.columns = ["SubscriptionArn", "Protocol", "Endpoint", "Owner"];
                view.render();
            });
        },

        openCreateSubscriptionDialog: function() {
            var subscriptionCreate = new SuscriptionCreate({ cred_id: this.credentialId, region: this.region, topic: this.selectedId});
            subscriptionCreate.render();
        },

        selectSubscription: function(event) {
            this.$subscriptionTable.$('tr').removeClass('row_selected');
            $(event.currentTarget).addClass('row_selected');
            var rowData = this.$subscriptionTable.fnGetData(event.currentTarget);
            this.selectedSubscription = this.subscriptions.get(rowData[0]);
            if(this.selectedSubscription) {
                $("#delete_subscription_button").removeClass("ui-state-disabled");
                $("#delete_subscription_button").removeAttr("disabled");
            }
        },

        deleteSubscription: function() {
            if(this.selectedSubscription) {
                this.selectedSubscription.destroy(this.credentialId, this.region);
            }
        }
    });
    
    return AwsTopicsAppView;
});
