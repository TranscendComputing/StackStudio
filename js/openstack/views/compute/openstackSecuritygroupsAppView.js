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
        '/js/openstack/models/compute/openstackSecurityGroupRule.js',
        '/js/openstack/collections/compute/openstackSecurityGroups.js',
        '/js/openstack/views/compute/openstackSecurityGroupCreateView.js',
        'icanhaz',
        'common',
        'jquery.dataTables'
], function( $, _, Backbone, ResourceAppView, openstackSecurityGroupAppTemplate, Securitygroup, SecurityGroupRule, Securitygroups, OpenstackSecurityGroupCreate, ich, Common ) {
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
            'click #resource_table tr': "clickOne",
            'click a.delete_rule': "deleteRule",
            'change select#new_rule_select': 'selectNewRule',
            'click button#add_rule_button': 'addRule'
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
            Common.vent.on("securityGroup:ruleDeleted", this.refreshRules, this);
            Common.vent.on("securityGroup:ruleAdded", this.refreshRules, this);
        },

        /** Called after details view has been rendered */
        toggleActions: function(e) {
            //Disable any needed actions
            this.selection = this.collection.get(this.selectedId);
            this.renderRulesTable();
        },
        
        performAction: function(event) {
            var securityGroup = this.collection.get(this.selectedId);

            switch(event.target.text)
            {
            case "Delete Security Group":
                securityGroup.destroy(this.credentialId);
                break;
            }
        },

        renderRulesTable: function() {
            this.$("button").button();
            var view = this;
            this.$rulesTable = $("table#rules_table").dataTable({
                "bJQueryUI": true,
                "bPaginate": false,
                "sDom": 't',
                "aoColumns": [
                    {"sTitle": "Port", "mDataProp": "port"},
                    {"sTitle": "Protocol", "mDataProp": "ip_protocol"},
                    {"sTitle": "Source", "mDataProp": "source"},
                    {"sTitle": "Action", "mDataProp": "action"}
                ]
            });
            this.$rulesTable.fnAddData(this.selection.get("rules"));
        },

        refreshRules: function(group) {
            if(group)
            {
                this.selection.attributes = this.selection.parse(group);
            }
            this.$rulesTable.fnClearTable();
            this.$rulesTable.fnAddData(this.selection.get("rules"));
        },

        selectNewRule: function(event) {
            this.newRuleData = $(event.currentTarget).find("option:selected").data();
            var portRange = "";
            if(this.newRuleData.fromPort !== undefined)
            {
                portRange = this.newRuleData.fromPort == this.newRuleData.toPort ? this.newRuleData.fromPort : (this.newRuleData.fromPort + "-" + this.newRuleData.toPort);
            }
            $("input#port_range_input").val(portRange);
            $("input#cidr_input").val(this.newRuleData.cidr);
        },

        addRule: function() {
            var rule = {};
            var ports = $("input#port_range_input").val().split("-");

            if(ports.length == 1)
            {
                rule["fromPort"] = ports[0];
                rule["toPort"] = ports[0];
            }else{
                rule["fromPort"] = ports[0];
                rule["toPort"] = ports[1];
            }
            if(this.$("input[name=source]:checked").val() == "cidr")
            {
                rule["cidr"] = this.$("input#cidr_input").val();
            }else{
                rule["groupId"] = this.$("input#group_input").val();
            }
            rule["ipProtocol"] = this.newRuleData ? this.newRuleData["protocol"] : "tcp";
            this.selection.addRule(rule, this.credentialId);
        },

        deleteRule: function(event) {
            var row = event.currentTarget.parentElement.parentElement,
                data = this.$rulesTable.fnGetData(row);
            this.selection.deleteRule(data.id, this.credentialId);
            return false;
        }
    });
    
    return OpenstackSecurityGroupsAppView;
});
