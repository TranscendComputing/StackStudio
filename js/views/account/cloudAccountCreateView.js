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
        'text!templates/account/cloudAccountCreateTemplate.html',
        '/js/models/group.js',
        'common'
        
], function( $, _, Backbone, DialogView, groupCreateTemplate, Group, Common ) {
    
    var GroupCreateView = DialogView.extend({

        group: new Group(),
        
        events: {
            "dialogclose": "close"
        },

        initialize: function() {
            var createView = this;
            var compiledTemplate = _.template(groupCreateTemplate);
            this.$el.html(compiledTemplate);

            this.$el.dialog({
                autoOpen: true,
                title: "Create Cloud Account",
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
            $("#org_select").selectmenu();
            $("#cloud_select").selectmenu();
        },

        create: function() {
            var newGroup = this.group;
            var options = {};
            
            if($("#group_name_input").val() !== "") {
                options.name = $("#group_name_input").val();
                options.description = $("#group_description_input").val();
                newGroup.create(options);
                this.$el.dialog('close');
            }else {
                Common.errorDialog("Invalid Request", "Please supply all required fields.");
            }
        }
    });
    
    return GroupCreateView;
});
