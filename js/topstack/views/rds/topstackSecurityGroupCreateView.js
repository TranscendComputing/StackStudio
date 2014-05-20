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
        'text!templates/topstack/cache/topstackSecurityGroupCreateTemplate.html',
        'topstack/models/rds/topstackDBSecurityGroup',
        'icanhaz',
        'common'
        
], function( $, _, Backbone, DialogView, securityGroupCreateTemplate, SecurityGroup, ich, Common ) {
    
    var TopStackSecurityGroupCreateView = DialogView.extend({

        credentialId: undefined,

        region: undefined,
        
        securityGroup: new SecurityGroup(),
        
        events: {
            "dialogclose": "close"
        },

        render: function() {
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

            if(!issue) {
                newSecurityGroup.create(options, this.credentialId, this.region);
                this.$el.dialog('close');
            } else {
                Common.errorDialog("Invalid Request", "Please supply all required fields.");
            }
        }
    });
    
    return TopStackSecurityGroupCreateView;
});
