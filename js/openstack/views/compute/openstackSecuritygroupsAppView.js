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
        'text!templates/openstack/compute/openstackSecurityGroupAppTemplate.html',
        '/js/openstack/models/compute/openstackSecurityGroup.js',
        '/js/openstack/collections/compute/openstackSecurityGroups.js',
        '/js/openstack/views/compute/openstackSecurityGroupCreateView.js',
        'icanhaz',
        'common',
        'jquery.dataTables'
], function( $, _, Backbone, ResourceAppView, openstackSecurityGroupAppTemplate, Securitygroup, Securitygroups, OpenstackSecurityGroupCreate, ich, Common ) {
    'use strict';

    // Openstack Security Group Application View
    // ------------------------------

    /**
     * OpenstackSecurityGroupsAppView is UI view list of openstack security groups.
     *
     * @name OpenstackSecurityGroupsAppView
     * @constructor
     * @category Resources
     * @param {Object} initialization object.
     * @returns {Object} Returns a OpenstackSecurityGroupsAppView instance.
     */
    var OpenstackSecurityGroupsAppView = ResourceAppView.extend({
        template: _.template(openstackSecurityGroupAppTemplate),
        
        modelStringIdentifier: "id",
        
        columns: ["id", "name", "description"],
        
        idColumnNumber: 0,
        
        model: Securitygroup,
        
        collectionType: Securitygroups,
        
        type: "compute",
        
        subtype: "securitygroups",
        
        CreateView: OpenstackSecurityGroupCreate,
        
        events: {
            'click .create_button': 'createNew',
            'click #action_menu ul li': 'performAction',
            'click #resource_table tr': "toggleActions"
        },

        initialize: function(options) {
            if(options.cred_id) {
                this.credentialId = options.cred_id;
            }
            this.render();
            
            var securityGroupApp = this;
            Common.vent.on("securityGroupAppRefresh", function() {
                securityGroupApp.render();
            });
        },
        
        toggleActions: function(e) {
            this.clickOne(e);
            //Disable any needed actions
        },
        
        performAction: function(event) {
            var securityGroup = this.collection.get(this.selectedId);

            switch(event.target.text)
            {
            case "Delete Security Group":
                securityGroup.destroy(this.credentialId);
                break;
            }
        }
    });
    
    return OpenstackSecurityGroupsAppView;
});
