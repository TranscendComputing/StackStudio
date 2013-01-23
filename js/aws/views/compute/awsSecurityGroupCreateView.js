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
        'text!templates/aws/compute/awsSecurityGroupCreateTemplate.html',
        '/js/aws/models/compute/awsSecurityGroup.js',
        'icanhaz',
        'common'
        
], function( $, _, Backbone, securityGroupCreateTemplate, securityGroup, ich, Common ) {
    
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
        
        // Delegated events for creating new instances, etc.
        events: {
            "dialogclose": "close"
        },

        initialize: function() {
            var createView = this;
            var compiledTemplate = _.template(securityGroupCreateTemplate);
            this.$el.html(compiledTemplate);

            this.$el.dialog({
                autoOpen: true,
                title: "Create Security Group",
                width:500,
                minHeight: 150,
                resizable: false,
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
        
        close: function() {
            console.log("close initiated");
            this.$el.dialog('close');
        },
        
        cancel: function() {
            this.$el.dialog('close');
        },
        
        create: function() {
            console.log("create_initiated");
            //Validate and create
            this.$el.dialog('close');
        }

    });

    console.log("aws security group create view defined");
    
    return AwsSecurityGroupCreateView;
});
