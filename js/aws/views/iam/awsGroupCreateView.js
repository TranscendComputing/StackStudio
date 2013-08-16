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
        'views/dialogView',
        'text!templates/aws/iam/awsGroupCreateTemplate.html',
        '/js/aws/models/iam/awsGroup.js',
        'common'      
], function( $, _, Backbone, DialogView, groupCreateTemplate, Group, Common ) {
    
    var GroupCreateView = DialogView.extend({

        template: _.template(groupCreateTemplate),

        credentialId: undefined,

        group: undefined,
        
        events: {
            "dialogclose": "close"
        },

        initialize: function(options) {
            this.credentialId = options.cred_id;
        },

        render: function() {
            var createView = this;
            this.$el.html(this.template);

            this.$el.dialog({
                autoOpen: true,
                title: "Create Group",
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
            this.group = new Group();
        },
        
        create: function() {
            var createView = this;
            var newGroup = this.group;
            var options = {};

            if($("#group_name_input").val() !== "") {
                options.GroupName = $("#group_name_input").val();
                newGroup.create(options, this.credentialId);
                this.$el.dialog('close');
            }else {
                Common.errorDialog("Invalid Request", "Please supply all required fields.");
            }
        }
    });
    
    return GroupCreateView;
});
