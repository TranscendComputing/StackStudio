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
        'text!templates/openstack/network/openstackFloatingIpAppTemplate.html',
        '/js/openstack/models/network/openstackFloatingIp.js',
        '/js/openstack/collections/network/openstackFloatingIps.js',
        '/js/openstack/views/network/openstackFloatingIpCreateView.js',
        'icanhaz',
        'common'
], function( $, _, Backbone, AppView, openstackFloatingIpAppTemplate, FloatingIp, FloatingIps, OpenstackFloatingIpCreateView, ich, Common ) {
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
	var OpenstackFloatingIpsAppView = AppView.extend({
	    template: _.template(openstackFloatingIpAppTemplate),
	    
        modelStringIdentifier: "id",
        
        columns: ["name", "id", "email", "enabled"],
        
        idColumnNumber: 1,
        
        model: FloatingIp,
        
        collectionType: FloatingIps,
        
        type: "network",
        
        subtype: "floatingIps",
        
        CreateView: OpenstackFloatingIpCreateView,
        
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
            
            var floating_ipApp = this;
            Common.vent.on("floatingIpAppRefresh", function() {
                floating_ipApp.render();
            });
        },
        
        toggleActions: function(e) {
            //Disable any needed actions
        },
        
        performAction: function(event) {
            var floating_ip = this.collection.get(this.selectedId);
            
            switch(event.target.text)
            {
            case "Delete FloatingIp":
                floating_ip.destroy(this.credentialId);
                break;
            }
        }
	});
    
	return OpenstackFloatingIpsAppView;
});
