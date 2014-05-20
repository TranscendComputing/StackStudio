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
        'openstack/models/compute/openstackKeyPair',
        'openstack/collections/compute/openstackKeyPairs',
        'openstack/views/compute/openstackKeyPairCreateView',
        'openstack/views/compute/openstackKeyPairImportView',
        'icanhaz',
        'common',
        'jquery.dataTables'
], function( $, _, Backbone, ResourceAppView, openstackKeyPairAppTemplate, Keypair, Keypairs, OpenstackKeyPairCreate, OpenstackKeyPairImport, ich, Common ) {
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
        ImportView: OpenstackKeyPairImport,
        
        events: {
            'click .create_button': 'createNew',
            'click .import_button': 'importKey',
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
        importKey: function(e) {
            var ImportView = this.ImportView;
            if(this.region) {
                this.importKeyDialog = new ImportView({cred_id: this.credentialId, region: this.region});
            }else {
                this.importKeyDialog = new ImportView({cred_id: this.credentialId});
            }
            this.importKeyDialog.render();
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
