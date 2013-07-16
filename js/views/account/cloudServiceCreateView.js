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
        'text!templates/account/cloudServiceCreateTemplate.html',
        'common'
        
], function( $, _, Backbone, DialogView, groupCreateTemplate, Common ) {
    
    var CloudServiceCreateView = DialogView.extend({

        cloud_account: undefined,
        
        events: {
            "dialogclose": "close"
        },

        initialize: function(options) {
            this.cloud_account = options.cloud_account;
            var createView = this;
            var compiledTemplate = _.template(groupCreateTemplate);
            this.$el.html(compiledTemplate);

            this.$el.dialog({
                autoOpen: true,
                title: "Create Cloud Service",
                resizable: false,
                width: 325,
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
            var options = {};
            options.enabled = true;
            
            var issue = false;
            
            if($("#host_input").val() !== "") {
                options.host = $("#host_input").val();
            }else{
                issue = true;
            }
            if($("#path_input").val() !== "") {
                options.path = $("#path_input").val();
            }else{
                issue = true;
            }
            if($("#port_input").val() !== "") {
                options.port = $("#port_input").val();
            }else{
                issue = true;
            }
            if($("#protocol_input").val() !== "") {
                options.protocol = $("#protocol_input").val();
            }else{
                issue = true;
            }
            if($("#service_type_input").val() !== "") {
                options.service_type = $("#service_type_input").val();
            }else{
                issue = true;
            }
            
            if(!issue){
                this.cloud_account.addService(options);
                this.$el.dialog('close');
            }else {
                Common.errorDialog("Invalid Request", "Please supply all required fields.");
            }
        }
    });
    
    return CloudServiceCreateView;
});
