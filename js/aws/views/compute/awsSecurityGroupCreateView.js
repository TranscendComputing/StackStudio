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
        'text!templates/aws/compute/awsSecurityGroupCreateTemplate.html',
        '/js/aws/models/compute/awsSecurityGroup.js',
        '/js/aws/collections/vpc/awsVpcs.js',
        'icanhaz',
        'common'
        
], function( $, _, Backbone, securityGroupCreateTemplate, SecurityGroup, VPCs, ich, Common ) {
    
    /**
     * awsSecurityGroupCreateView is UI form to create compute.
     *
     * @name InstanceCreateView
     * @constructor
     * @category Compute
     * @param {Object} initialization object.
     * @returns {Object} Returns a awsSecurityGroupCreateView instance.
     */
    
    var AwsSecurityGroupCreateView = Backbone.View.extend({
        
        tagName: "div",
        
        credentialId: undefined,
        
        securityGroup: new SecurityGroup(),
        
        vpcs: new VPCs(),
        
        // Delegated events for creating new instances, etc.
        events: {
            "dialogclose": "close"
        },

        initialize: function(options) {
            this.credentialId = options.cred_id;
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
            $("#vpc_select").selectmenu();
            
            this.vpcs.on( 'reset', this.addAllVPCs, this );
            this.vpcs.fetch({ data: $.param({ cred_id: this.credentialId}) });
        },

        render: function() {
            
        },
        
        addAllVPCs: function() {
            this.vpcs.each(function(vpc) {
               $("#vpc_select").append("<option>" + vpc.id + "</option>");
            });
            $("#vpc_select").selectmenu();
        },
        
        close: function() {
            this.$el.remove();
        },
        
        cancel: function() {
            this.$el.dialog('close');
        },
        
        create: function() {
            var newSecurityGroup = this.securityGroup;
            var options = {};
            var alert = false;
            
            if($("#sg_name").val() !== "" && $("#sg_desc").val() !== "" ) {
                options.name = $("#sg_name").val();
                options.description = $("#sg_desc").val();
            }else {
                alert = true;
            }
            
            if($("#vpc_select").val() !== "No VPC") {
                options.vpc_id = $("#vpc_select").val();
            }
            
            if(!alert) {
                newSecurityGroup.create(options, this.credentialId);
                this.$el.dialog('close');
            } else {
                alert("Please supply the required fields.");
            }
        }

    });

    console.log("aws security group create view defined");
    
    return AwsSecurityGroupCreateView;
});
