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
        'text!templates/aws/cloud_watch/awsAlarmAppTemplate.html',
        '/js/aws/models/cloud_watch/awsAlarm.js',
        '/js/aws/collections/cloud_watch/awsAlarms.js',
        '/js/aws/views/cloud_watch/awsAlarmCreateView.js',
        'icanhaz',
        'common',
        'jquery.dataTables'
], function( $, _, Backbone, ResourceAppView, awsAlarmAppTemplate, Alarm, Alarms, AwsAlarmCreate, ich, Common ) {
    'use strict';

    // Aws Reserved Instance Application View
    // ------------------------------

    /**
     * AwsAlarmAppView is UI view list of aws alarms.
     *
     * @name AwsAlarmAppView
     * @constructor
     * @category Resources
     * @param {Object} initialization object.
     * @returns {Object} Returns a AwsAlarmAppView instance.
     */
    var AwsAlarmAppView = ResourceAppView.extend({
        template: _.template(awsAlarmAppTemplate),
        
        modelStringIdentifier: "id",
        
        columns: ["id", "threshold", "state_value"],
        
        idColumnNumber: 0,
        
        model: Alarm,
        
        collectionType: Alarms,
        
        type: "cloud_watch",
        
        subtype: "alarms",
        
        CreateView: AwsAlarmCreate,
        
        events: {
            'click .create_button': 'createNew',
            'click #action_menu ul li': 'performAction',
            'click #resource_table tr': "clickOne",
            'click #history_tab' : 'refreshHistoryTab'
        },

        initialize: function(options) {
            if(options.cred_id) {
                this.credentialId = options.cred_id;
            }
            if(options.region) {
                this.region = options.region;
            }
            this.render();
            
            $("#alarm_history").dataTable({
                "bJQueryUI": true,
                "sDom": 't'
            });
            
            var alarmApp = this;
            Common.vent.on("alarmAppRefresh", function() {
                alarmApp.render();
            });
            Common.vent.on("alarmHistoryRefresh", function(data) {
                alarmApp.addAlarmHistory(data);
            });
        },
        
        toggleActions: function(e) {
            //Disable any needed actions
        },
        
        performAction: function(event) {
            var alarm = this.collection.get(this.selectedId);
            
            switch(event.target.text)
            {
            case "Delete Alarm":
                alarm.destroy(this.credentialId, this.region);
                break;
            }
        },
        
        refreshHistoryTab: function(e){
            var alarm = this.collection.get(this.selectedId);
            alarm.getAlarmHistory(this.credentialId, this.region);
        },
        
        addAlarmHistory: function(data){
            $("#alarm_history").dataTable().fnClearTable();
            for(var i in data){
                $("#alarm_history").dataTable().fnAddData([data[i]['HistorySummary'],data[i]['HistoryItemType'],data[i]['Timestamp']]);
            }
            $("#alarm_history").dataTable();
        }
    });
    
    return AwsAlarmAppView;
});
