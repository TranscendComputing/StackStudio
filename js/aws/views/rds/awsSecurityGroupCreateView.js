/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true alert:true*/
define([
        'jquery',
        'underscore',
        'backbone',
        'views/dialogView',
        'text!templates/aws/compute/awsSecurityGroupCreateTemplate.html',
        'aws/models/rds/awsDBSecurityGroup',
        'aws/collections/vpc/awsVpcs',
        'icanhaz',
        'common'
        
], function( $, _, Backbone, DialogView, securityGroupCreateTemplate, SecurityGroup, VPCs, ich, Common ) {
    
    /**
     * awsSecurityGroupCreateView is UI form to create compute.
     *
     * @name InstanceCreateView
     * @constructor
     * @category Compute
     * @param {Object} initialization object.
     * @returns {Object} Returns a awsSecurityGroupCreateView instance.
     */
    
    var AwsSecurityGroupCreateView = DialogView.extend({

        credentialId: undefined,

        region: undefined,
        
        securityGroup: new SecurityGroup(),
        
        vpcs: new VPCs(),
        
        // Delegated events for creating new instances, etc.
        events: {
            "dialogclose": "close"
        },

        initialize: function(options) {
            this.credentialId = options.cred_id;
            this.region = options.region;
            var createView = this;
            var compiledTemplate = _.template(securityGroupCreateTemplate);
            this.$el.html(compiledTemplate);

            this.$el.dialog({
                autoOpen: true,
                title: "Create Security Group",
                resizable: false,
                width: 425,
                modal: true,
                buttons: {
                    Create: function () {
                        createView.create();
                    },
                    Cancel: function() {
                        createView.cancel();
                    }
                }
            });
            
            this.vpcs.on( 'reset', this.addAllVPCs, this );
            this.vpcs.fetch({ data: $.param({ cred_id: this.credentialId, region: this.region }), reset: true });
        },

        render: function() {
            
        },
        
        addAllVPCs: function() {
            this.vpcs.each(function(vpc) {
               $("#vpc_select").append("<option>" + vpc.id + "</option>");
            });
        },

        create: function() {
            var newSecurityGroup = this.securityGroup;
            var options = {};
            var issue = false;
            
            if($("#sg_name").val() !== "" && $("#sg_desc").val() !== "" ) {
                options.id = $("#sg_name").val();
                options.description = $("#sg_desc").val();
            }else {
                issue = true;
            }
            /*
            if($("#vpc_select").val() !== "No VPC") {
                options.vpc_id = $("#vpc_select").val();
            }
            */
            if(!issue) {
                newSecurityGroup.create(options, this.credentialId, this.region);
                this.$el.dialog('close');
            } else {
                Common.errorDialog("Invalid Request", "Please supply all required fields.");
            }
        }
    });
    
    return AwsSecurityGroupCreateView;
});
