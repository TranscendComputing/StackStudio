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
        'text!templates/openstack/compute/openstackSecurityGroupCreateTemplate.html',
        'openstack/models/compute/openstackSecurityGroup',
        'icanhaz',
        'common'
        
], function( $, _, Backbone, DialogView, securityGroupCreateTemplate, SecurityGroup, ich, Common ) {
    
    /**
     * openstackSecurityGroupCreateView is UI form to create compute.
     *
     * @name InstanceCreateView
     * @constructor
     * @category Compute
     * @param {Object} initialization object.
     * @returns {Object} Returns a openstackSecurityGroupCreateView instance.
     */
    
    var OpenstackSecurityGroupCreateView = DialogView.extend({

        credentialId: undefined,
        
        securityGroup: new SecurityGroup(),
        
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
        },

        render: function() {
            
        },

        create: function() {
            var newSecurityGroup = this.securityGroup;
            var options = {};
            var issue = false;
            
            if($("#sg_name").val() !== "" && $("#sg_desc").val() !== "" ) {
                options.name = $("#sg_name").val();
                options.description = $("#sg_desc").val();
            }else {
                issue = true;
            }
            
            if(!issue) {
                newSecurityGroup.create(options, this.credentialId);
                this.$el.dialog('close');
            } else {
                Common.errorDialog("Invalid Request", "Please supply all required fields.");
            }
        }

    });

    console.log("openstack security group create view defined");
    
    return OpenstackSecurityGroupCreateView;
});
