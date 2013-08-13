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
        'text!templates/openstack/compute/openstackKeyPairAppTemplate.html',
        '/js/openstack/models/compute/openstackKeyPair.js',
        '/js/openstack/collections/compute/openstackKeyPairs.js',
        '/js/openstack/views/compute/openstackKeyPairCreateView.js',
        'icanhaz',
        'common',
        'jquery.dataTables'
], function( $, _, Backbone, ResourceAppView, openstackKeyPairAppTemplate, Keypair, Keypairs, OpenstackKeyPairCreate, ich, Common ) {
    'use strict';

    // Openstack Security Group Application View
    // ------------------------------

    /**
     * OpenstackKeyPairsAppView is UI view list of openstack key pairs.
     *
     * @name OpenstackSecurityGroupsAppView
     * @constructor
     * @category Resources
     * @param {Object} initialization object.
     * @returns {Object} Returns a OpenstackKeyPairsAppView instance.
     */
    var OpenstackKeyPairsAppView = ResourceAppView.extend({
        template: _.template(openstackKeyPairAppTemplate),
        
        modelStringIdentifier: "name",
        
        columns: ["name", "fingerprint"],
        
        idColumnNumber: 0,
        
        model: Keypair,
        
        collectionType: Keypairs,
        
        type: "compute",
        
        subtype: "keypairs",
        
        CreateView: OpenstackKeyPairCreate,
        
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
            
            var keyPairApp = this;
            Common.vent.on("keyPairAppRefresh", function() {
                keyPairApp.render();
            });
            Common.vent.on("keyPairAppDelayRefresh", function() {
                setTimeout(function() {
                    keyPairApp.render();
                }, 2000);
            });
        },
        
        toggleActions: function(e) {
            //Disable any needed actions
        },
        
        performAction: function(event) {
            var keyPair = this.collection.get(this.selectedId);
            
            switch(event.target.text)
            {
            case "Delete Key Pair":
                keyPair.destroy(this.credentialId, this.region);
                break;
            }
        }
    });
    
    return OpenstackKeyPairsAppView;
});
