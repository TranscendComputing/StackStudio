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
        'models/continuousIntegrationServer',
        'common',
        'util/url'

], function( $, _, Backbone, DialogView, ciServerAddEditTemplate, CIServer, Common, URL ) {

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
            this.rootView = options.rootView;

            var title = "Add CI Server";
            if(options && options.ci_server) {
                title = "Edit CI Server";
                this.ciServer = options.ci_server;
            }

            this.$el.dialog({
                autoOpen: true,
                title: title,
                resizable: false,
                width: 400,
                modal: true,
                buttons: {
                    Save: function () {
                        createView.validate();
                    },
                    Cancel: function() {
                        createView.cancel();
                    }
                }
            });
            // Bind save function to keep scope from the callback of URL.validate
            _.bindAll(this, 'save');
            this.render();

            var thisView = this;
            setTimeout(function () {
                if(thisView.rootView.afterSubAppRender) {
                    thisView.rootView.afterSubAppRender(thisView);
                }
            }, 5);
        },

        render: function() {
            if(this.ciServer) {
                $("#ci_name_input").val(this.ciServer.attributes["name"]);
                $("#ci_url_input").val(this.ciServer.attributes["url"]);
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

        validate: function() {
            // This checks for valid URL, and returns true or false in the callback
            // The second parameter is the callback
            URL.validate($("#ci_url_input").val(), this.save);
        },

        save: function(urlValidation) {
            if(urlValidation) {
                var options = {};
                var issue = false;

                if($("#ci_name_input").val().trim() === "") {
                    this.displayValid(false, "#ci_name_input");
                    issue = true;
                }else {
                    this.displayValid(true, "#ci_name_input");
                    options["name"] = $("#ci_name_input").val();
                }

                options["url"] = $("#ci_url_input").val();
                options["type"] = $("#ci_type_select").val();
                options["org_id"] = Common.account.org_id;

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
            } else {
                this.displayValid(false, "#ci_url_input");
                Common.errorDialog("Invalid Request", "Unable to connect to the provided URL.");
            }

        }
    });

    return CIServerAddEditView;
});
