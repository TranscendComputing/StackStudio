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
        'views/resourceAppView',
        'text!templates/openstack/compute/openstackElasticIPAppTemplate.html',
        '/js/openstack/models/compute/openstackElasticIP.js',
        '/js/openstack/collections/compute/openstackElasticIPs.js',
        '/js/openstack/views/compute/openstackElasticIPsCreateView.js',
        '/js/openstack/views/compute/openstackElasticIPAssociateView.js',
        'icanhaz',
        'common',
        'jquery.dataTables'
], function( $, _, Backbone, ResourceAppView, openstackElasticIPAppTemplate, Elasticip, Elasticips, OpenstackElasticIPsCreate, OpenstackElasticIpAssociate, ich, Common ) {
    'use strict';

    // Openstack Elastic IP Application View
    // ------------------------------

    /**
     * OpenstackElasticIPsAppView is UI view list of openstack key pairs.
     *
     * @name OpenstackElasticIPsAppView
     * @constructor
     * @category Resources
     * @param {Object} initialization object.
     * @returns {Object} Returns a OpenstackElasticIPsAppView instance.
     */
    var OpenstackElasticIPsAppView = ResourceAppView.extend({
        template: _.template(openstackElasticIPAppTemplate),
        
        modelStringIdentifier: "id",
        
        columns: ["id", "ip", "fixed_ip", "pool"],
        
        idColumnNumber: 0,
        
        model: Elasticip,
        
        collectionType: Elasticips,
        
        type: "compute",
        
        subtype: "elasticips",
        
        CreateView: OpenstackElasticIPsCreate,
        
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
            
            var elasticIpApp = this;
            Common.vent.on("elasticIPAppRefresh", function() {
                elasticIpApp.render();
            });
        },
        
        toggleActions: function(e) {
            //Disable any needed actions
            var eip = this.collection.get(this.selectedId),
                actionsMenu = $("#action_menu").menu("option", "menus"),
                actionItem;
            _.each($("#action_menu").find(actionsMenu).find("li"), function(item){

                actionItem = $(item);
                if(actionItem.text() === "Disassociate Address")
                {
                    this.toggleActionItem(actionItem, eip.get("instance_id") === null);
                }
                if(actionItem.text() === "Associate Address" || actionItem.text() === "Release Address")
                {
                    this.toggleActionItem(actionItem, eip.get("instance_id") !== null);
                }
            }, this);
        },
        
        performAction: function(event) {
            var elasticIp = this.collection.get(this.selectedId);
            
            switch(event.target.text)
            {
            case "Release Address":
                elasticIp.destroy(this.credentialId, this.region);
                break;
            case "Associate Address":
                new OpenstackElasticIpAssociate({cred_id: this.credentialId, region: this.region, elastic_ip: elasticIp});
                break;
            case "Disassociate Address":
                elasticIp.disassociateAddress(this.credentialId, this.region);
                break;
            }
        }
    });
    
    return OpenstackElasticIPsAppView;
});
