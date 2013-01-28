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
        'text!templates/aws/cloud_watch/awsAlarmCreateTemplate.html',
        '/js/aws/models/cloud_watch/awsAlarm.js',
        'icanhaz',
        'common'
        
], function( $, _, Backbone, alarmCreateTemplate, Alarm, ich, Common ) {
    
    /**
     * awsAlarmCreateView is UI form to create compute.
     *
     * @name InstanceCreateView
     * @constructor
     * @category CloudWatch
     * @param {Object} initialization object.
     * @returns {Object} Returns a awsAlarmCreateView instance.
     */
    
    var AwsAlarmCreateView = Backbone.View.extend({
        
        tagName: "div",
        
        // Delegated events for creating new alarms, etc.
        events: {
            "dialogclose": "close"
        },

        initialize: function() {
            var createView = this;
            var compiledTemplate = _.template(alarmCreateTemplate);
            this.$el.html(compiledTemplate);

            this.$el.dialog({
                autoOpen: true,
                title: "Create Alarm",
                width:350,
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

        render: function() {
            
        },
        
        close: function() {
            console.log("close initiated");
            this.$el.dialog('close');
        },
        
        cancel: function() {
            this.$el.dialog('close');
        },
        
        create: function() {
            console.log("create_initiated");
            //Validate and create
            this.$el.dialog('close');
        }

    });

    console.log("aws alarm create view defined");
    
    return AwsAlarmCreateView;
});
