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
        'text!templates/aws/rds/awsParameterGroupCreateTemplate.html',
        'aws/models/rds/awsDBParameterGroup',
        'icanhaz',
        'common'
        
], function( $, _, Backbone, DialogView, parameterGroupCreateTemplate, ParameterGroup, ich, Common ) {
    
    /**
     * awsParameterGroupCreateView is UI form to create compute.
     *
     * @name InstanceCreateView
     * @constructor
     * @category Compute
     * @param {Object} initialization object.
     * @returns {Object} Returns a awsParameterGroupCreateView instance.
     */
    
    var AwsParameterGroupCreateView = DialogView.extend({

        credentialId: undefined,

        region: undefined,
        
        securityGroup: new ParameterGroup(),
        
        // Delegated events for creating new instances, etc.
        events: {
            "dialogclose": "close"
        },

        initialize: function(options) {
            this.credentialId = options.cred_id;
            this.region = options.region;
            var createView = this;
            var compiledTemplate = _.template(parameterGroupCreateTemplate);
            this.$el.html(compiledTemplate);

            this.$el.dialog({
                autoOpen: true,
                title: "Create Parameter Group",
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
            var newParameterGroup = this.securityGroup;
            var options = {};
            var issue = false;
            
            if($("#pg_name").val() !== "" && $("#pg_desc").val() !== "" ) {
                options.id = $("#pg_name").val();
                options.description = $("#pg_desc").val();
                options.family = $("#family_select").val();
            }else {
                issue = true;
            }
            
            if(!issue) {
                newParameterGroup.create(options, this.credentialId, this.region);
                this.$el.dialog('close');
            } else {
                Common.errorDialog("Invalid Request", "Please supply all required fields.");
            }
        }
    });
    
    return AwsParameterGroupCreateView;
});
