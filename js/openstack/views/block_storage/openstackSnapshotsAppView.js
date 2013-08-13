/*!
 * (c) Copyright 2012-2013 Transcend Computing, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the License);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an AS IS BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
        'text!templates/openstack/block_storage/openstackSnapshotAppTemplate.html',
        '/js/openstack/models/block_storage/openstackSnapshot.js',
        '/js/openstack/collections/block_storage/openstackSnapshots.js',
        '/js/openstack/views/block_storage/openstackSnapshotCreateView.js',
        'icanhaz',
        'common'
], function( $, _, Backbone, AppView, openstackSnapshotAppTemplate, Snapshot, Snapshots, OpenstackSnapshotCreateView, ich, Common ) {
	'use strict';

	// Openstack Application View
	// ------------------------------

    /**
     * Openstack AppView is UI view list of cloud items.
     *
     * @name AppView
     * @constructor
     * @category Resources
     * @param {Object} initialization object.
     * @returns {Object} Returns an OpenstackAppView instance.
     */
	var OpenstackSnapshotsAppView = AppView.extend({
	    template: _.template(openstackSnapshotAppTemplate),
	    
        modelStringIdentifier: "id",
        
        columns: ["name", "id", "size", "status"],
        
        idColumnNumber: 1,
        
        model: Snapshot,
        
        collectionType: Snapshots,
        
        type: "block_storage",
        
        subtype: "snapshots",
        
        CreateView: OpenstackSnapshotCreateView,
        
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
            
            var snapshotApp = this;
            Common.vent.on("snapshotAppRefresh", function() {
                snapshotApp.render();
            });
        },
        
        toggleActions: function(e) {
            //Disable any needed actions
            var snapshot = this.collection.get(this.selectedId);
            var actionsMenu = $("#action_menu").menu("option", "menus");
            _.each($("#action_menu").find(actionsMenu).find("li"), function(item){
                var actionItem = $(item);
                if(actionItem.text() === "Create Snapshot")
                {
                    this.toggleActionItem(actionItem, snapshot.get("status") !== "available");
                }
                if(actionItem.text() === "Delete Snapshot")
                {
                    this.toggleActionItem(actionItem, snapshot.get("status") === "in-use");
                }
            }, this);
        },
        
        performAction: function(event) {
            var snapshot = this.collection.get(this.selectedId);
            
            switch(event.target.text)
            {
            case "Delete Snapshot":
                snapshot.destroy(this.credentialId);
                break;
            }
        }
	});
    
	return OpenstackSnapshotsAppView;
});
