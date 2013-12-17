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
        'text!templates/account/continuousIntegrationServerAddEditTemplate.html',
        '/js/models/continuousIntegrationServer.js',
        'common'
        
], function( $, _, Backbone, DialogView, ciServerAddEditTemplate, CIServer, Common ) {
    
    var CIServerAddEditView = DialogView.extend({

        template: undefined,
        ciServer: undefined,
        
        events: {
            "dialogclose": "close"
        },

        initialize: function(options) {
            var createView = this;
            this.template = _.template(ciServerAddEditTemplate);
            this.$el.html(this.template);

            var title = "Add CI Server";
            if(options && options.ci_server) {
                title = "Edit CI Server";
                this.ciServer = options.ci_server;
            }

            this.$el.dialog({
                autoOpen: true,
                title: title,
                resizable: false,
                width: 350,
                modal: true,
                buttons: {
                    Save: function () {
                        createView.save();
                    },
                    Cancel: function() {
                        createView.cancel();
                    }
                }
            });
            this.render();
        },

        render: function() {
            debugger
            if(this.ciServer) {
                $("#ci_name_input").val(this.ciServer.attributes["name"]);
                $("#ci_host_input").val(this.ciServer.attributes["host"]);
                $("#ci_port_input").val(this.ciServer.attributes["port"]);
                $("#ci_protocol_select").val(this.ciServer.attributes["protocol"]);
                $("#ci_username_input").val(this.ciServer.attributes["username"]);
                $("#ci_password_input").val(this.ciServer.attributes["password"]);
            }
        },

        displayValid: function(valid, selector) {
            if(valid) {
                $(selector).css("border-color", "");
            }else{
                $(selector).css("border-color", "#FF0000");
            }
        },

        save: function() {
            var options = {};
            var issue = false;
            
            if($("#ci_name_input").val().trim() === "") {
                this.displayValid(false, "#ci_name_input");
                issue = true;
            }else {
                this.displayValid(true, "#ci_name_input");
                options["name"] = $("#ci_name_input").val();
            }

            if($("#ci_host_input").val().trim() === "") {
                this.displayValid(false, "#ci_host_input");
                issue = true;
            }else {
                this.displayValid(true, "#ci_host_input");
                options["host"] = $("#ci_host_input").val();
            }

            if($("#ci_port_input").val().trim() === "") {
                this.displayValid(false, "#ci_port_input");
                issue = true;
            }else {
                this.displayValid(true, "#ci_port_input");
                options["port"] = $("#ci_port_input").val();
            }

            options["type"] = $("#ci_type_select").val();
            options["protocol"] = $("#ci_protocol_select").val();
            options["org_id"] = sessionStorage.org_id;

            if($("#ci_username_input").val().trim() !== "") {
                options["username"] = $("#ci_username_input").val();
            }
            if($("#ci_password_input").val().trim() !== "") {
                options["password"] = $("#ci_password_input").val();
            }

            if(!issue) {
               if(this.ciServer) {
                    this.ciServer.update(options);
                }else {
                    this.ciServer = new CIServer();
                    this.ciServer.create(options);
                }
                this.close();
            }else {
                Common.errorDialog("Invalid Request", "Please supply all required fields.");
            }
        }

    });
    
    return CIServerAddEditView;
});
