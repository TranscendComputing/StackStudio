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
        'text!templates/aws/cache/awsSecurityGroupAppTemplate.html',
        'aws/models/rds/awsDBSecurityGroup',
        'aws/collections/rds/awsDBSecurityGroups',
        'aws/views/rds/awsSecurityGroupCreateView',
        'aws/collections/compute/awsSecurityGroups',
        'icanhaz',
        'common',
        'jquery.dataTables'
], function( $, _, Backbone, ResourceAppView, awsSecurityGroupAppTemplate, Securitygroup, Securitygroups, AwsSecurityGroupCreate, NovaGroups, ich, Common ) {
    'use strict';

    // Aws Security Group Application View
    // ------------------------------

    /**
     * AwsSecurityGroupsAppView is UI view list of aws security groups.
     *
     * @name AwsSecurityGroupsAppView
     * @constructor
     * @category Resources
     * @param {Object} initialization object.
     * @returns {Object} Returns a AwsSecurityGroupsAppView instance.
     */
    var AwsSecurityGroupsAppView = ResourceAppView.extend({
        template: _.template(awsSecurityGroupAppTemplate),
        
        modelStringIdentifier: "id",
        
        //columns: ["group_id", "name", "description"],
        columns: ["id", "description"],
        
        idColumnNumber: 0,
        
        model: Securitygroup,
        
        collectionType: Securitygroups,
        
        type: "rds",
        
        subtype: "securitygroups",
        
        CreateView: AwsSecurityGroupCreate,
        
        events: {
            'click .create_button': 'createNew',
            'click #action_menu ul li': 'performAction',
            'click #resource_table tr': "clickOne",
            'click #add_cidr':'addCIDR',
            'click #add_ec2':'addNovaGroup',
            'click .revoke-btn':'revokeRule'
        },

        actions: [
            { text: "Delete Security Group", type: "row" }
        ],

        initialize: function(options) {
            if(options.cred_id) {
                this.credentialId = options.cred_id;
            }
            if(options.region) {
                this.region = options.region;
            }
            this.$el.html(this.template);
            this.loadData({ render: true });
            
            var securityGroupApp = this;
            Common.vent.on("securityGroupAppRefresh", function() {
                securityGroupApp.render();
            });
            
            this.novaGroups = new NovaGroups();
            this.novaGroups.on( 'reset', this.addAllNovaGroups, this );
            this.novaGroups.fetch({ data: $.param({ cred_id: this.credentialId, region: this.region }), reset: true });
        },
        
        toggleActions: function(e) {
            //Disable any needed actions
            var ip_ranges = this.reduceHashes(this.collection.get(this.selectedId).get('ip_ranges'));
            var ec2_security_groups = this.reduceHashes(this.collection.get(this.selectedId).get('ec2_security_groups'));
            $('#cidrip_table').dataTable( {
                "aaData": ip_ranges,
                "aoColumns": [
                    { "sTitle": "CIDRIP" },
                    { "sTitle": "Status" }
                ],
                "bPaginate": false,
                "sDom": 't',
                "bJQueryUI": true
            } );
            $('#ec2groups_table').dataTable( {
                "aaData": ec2_security_groups,
                "aoColumns": [
                    { "sTitle": "EC2SecurityGroupOwnerId" },
                    { "sTitle": "EC2SecurityGroupName" },
                    { "sTitle": "Status" }
                ],
                "bPaginate": false,
                "sDom": 't',
                "bJQueryUI": true
            } );
            $('#rules_tab tbody').hide().show('slow');
            $("#rules_tab tbody tr").on('click',function(event) {
                $("#rules_tab tbody tr").removeClass('row_selected');
                $(this).addClass('row_selected');
            });
            
            this.novaGroups.fetch({ data: $.param({ cred_id: this.credentialId, region: this.region }), reset: true });
        },
        
        reduceHashes: function(array){
            var reduced = [];
            for(var i in array){
                var frag = [];
                for(var key in array[i]){
                    frag.push(array[i][key]);
                }
                reduced.push(frag);
            }
            return reduced;
        },
        
        addCIDR: function(){
            var rds_sg = this.collection.get(this.selectedId);
            rds_sg.addCIDR($("#cidr_input").val(),this.credentialId,this.region);
        },
        
        addNovaGroup: function(){
            var rds_sg = this.collection.get(this.selectedId);
            rds_sg.addNovaGroup($("#select_ec2").val(),this.credentialId,this.region);
        },
        
        revokeRule: function(e){
            var rds_sg = this.collection.get(this.selectedId);
            if($('#cidrip_table').has($('#rules_tab .row_selected')).length > 0){
                rds_sg.revokeCIDR($($('#rules_tab .row_selected td')[0]).html(),this.credentialId,this.region);
            }else if($('#ec2groups_table').has($('#rules_tab .row_selected')).length > 0){
                rds_sg.revokeNovaGroup($($('#rules_tab .row_selected td')[1]).html(),this.credentialId,this.region);
            }
        },
        
        addAllNovaGroups: function() {
            $("#select_ec2").empty();
            this.novaGroups.each(function(sg) {
                if(sg.attributes.name) {
                    $("#select_ec2").append($("<option></option>").text(sg.attributes.name));
                }
            });
        },
        
        performAction: function(event) {
            var securityGroup = this.collection.get(this.selectedId);

            switch(event.target.text)
            {
            case "Delete Security Group":
                securityGroup.destroy(this.credentialId, this.region);
                break;
            }
        }
    });
    
    return AwsSecurityGroupsAppView;
});
