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
        'text!templates/openstack/cloud_watch/openstackAlarmAppTemplate.html',
        '/js/openstack/models/cloud_watch/openstackAlarm.js',
        '/js/openstack/collections/cloud_watch/openstackAlarms.js',
        '/js/openstack/views/cloud_watch/openstackAlarmCreateView.js',
        'icanhaz',
        'common',
        'jquery.dataTables'
], function( $, _, Backbone, ResourceAppView, openstackAlarmAppTemplate, Alarm, Alarms, OpenstackAlarmCreate, ich, Common ) {
    'use strict';

    var OpenstackAlarmAppView = ResourceAppView.extend({
        template: _.template(openstackAlarmAppTemplate),
        
        modelStringIdentifier: "id",
        
        columns: ["id", "threshold", "state_value"],
        
        idColumnNumber: 0,
        
        model: Alarm,
        
        collectionType: Alarms,
        
        type: "cloud_watch",
        
        subtype: "alarms",
        
        CreateView: OpenstackAlarmCreate,
        
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
            
            var alarmApp = this;
            Common.vent.on("alarmAppRefresh", function() {
                alarmApp.render();
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
        }
    });
    
    return OpenstackAlarmAppView;
});
