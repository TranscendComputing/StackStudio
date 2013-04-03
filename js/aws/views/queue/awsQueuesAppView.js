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
        'text!templates/aws/queue/awsQueueAppTemplate.html',
        '/js/aws/models/queue/awsQueue.js',
        '/js/aws/collections/queue/awsQueues.js',
        '/js/aws/views/queue/awsQueueCreateView.js',
        'icanhaz',
        'common'
], function( $, _, Backbone, ResourceAppView, queueAppTemplate, Queue, Queues, QueueCreateView, ich, Common ) {
    'use strict';

    var AwsQueueAppView = ResourceAppView.extend({

        template: _.template(queueAppTemplate),
        
        modelStringIdentifier: "QueueName",
        
        columns: ["QueueName", "ApproximateNumberOfMessages", "ApproximateNumberOfMessagesNotVisible", "CreatedTimestamp"],
        
        idColumnNumber: 0,
        
        model: Queue,
        
        collectionType: Queues,

        type: "queue",
        
        subtype: "queues",

        CreateView: QueueCreateView,
        
        events: {
            'click .create_button': 'createNew',
            'click #action_menu ul li': 'performAction',
            'click #resource_table tr': "clickOne"
        },

        initialize: function(options) {
            if(options.cred_id) {
                this.credentialId = options.cred_id;
            }
            if(options.region) {
                this.region = options.region;
            }
            this.render();
            
            var userApp = this;
            Common.vent.off("queueAppRefresh");
            Common.vent.on("queueAppRefresh", function() {
                userApp.render();
            });
        },
        
        toggleActions: function(e) {
            //Disable any needed actions
        },
        
        performAction: function(event) {
            var queue = this.collection.get(this.selectedId);

            switch(event.target.text)
            {
            case "Delete Queue":
                queue.destroy(this.credentialId, this.region);
                break;
            }
        }
    });
    
    return AwsQueueAppView;
});
