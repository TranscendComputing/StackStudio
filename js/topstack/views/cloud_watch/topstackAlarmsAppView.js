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
        'text!templates/topstack/cloud_watch/topstackAlarmAppTemplate.html',
        '/js/topstack/models/cloud_watch/topstackAlarm.js',
        '/js/topstack/collections/cloud_watch/topstackAlarms.js',
        'icanhaz',
        'common',
        'jquery.dataTables'
], function( $, _, Backbone, ResourceAppView, topstackAlarmAppTemplate, Alarm, Alarms, ich, Common ) {
    'use strict';

    var TopStackAlarmAppView = ResourceAppView.extend({
        template: _.template(topstackAlarmAppTemplate),
        
        modelStringIdentifier: "id",
        
        columns: ["id", "threshold", "state_value"],
        
        idColumnNumber: 0,
        
        model: Alarm,
        
        collectionType: Alarms,
        
        type: "cloud_watch",
        
        subtype: "alarms",
        
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
            var alarm = this.collection.get(this.selectedId);
            $("#rc_name").html(alarm.attributes.dimensions[0].Value);
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
            for(var i in data){
                $("#alarm_history").dataTable().fnAddData([data[i]['HistorySummary'],data[i]['HistoryItemType'],data[i]['Timestamp']]);
            }
            $("#alarm_history").dataTable();
        }
    });
    
    return TopStackAlarmAppView;
});
