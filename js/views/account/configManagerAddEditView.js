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
        'icanhaz',
        'views/dialogView',
        'models/configManager',
        'text!templates/account/configManagerAddEditTemplate.html',
        'common'
        
], function( $, _, Backbone, ich, DialogView, ConfigManager, managerAddEditTemplate, Common ) {
    var ConfigManagerAddEditView = DialogView.extend({
        configManager: undefined,

        events: {
            "dialogclose": "close",
            "change #manager_type_select": "cmTypeChanged"
        },

        initialize: function(options) {
            var createView = this;
            this.template = _.template(managerAddEditTemplate);
            this.$el.html(this.template);
            this.configManagers = options.configManagers;
            var title = "Add Configuration Manager";
            if(options && options.configManager) {
                title = "Edit Configuration Manager";
                this.configManager = options.configManager;
            }

            this.$el.dialog({
                autoOpen: true,
                title: title,
                resizable: false,
                width: 425,
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
            ich.refresh();
            this.render();
        },

        render: function() {
            if(this.configManager) {
                $("#manager_name_input").val(this.configManager.attributes["name"]);
                $("#manager_url_input").val(this.configManager.attributes["url"]);
                $("#manager_type_select").val(this.configManager.attributes["type"]);
                $("#manager_type_row").hide();
            }
            this.cmTypeChanged();
            this.populateManagerSpecifics();
        },

        cmTypeChanged: function() {
            $("#manger_type_specifics").empty();
            var data = [];
            switch($("#manager_type_select").val()) {
                case "puppet":
                    data = [ 
                        {"propertyLabel": "Foreman User","tag": "input","inputType": "text","property": "foreman_user"},
                        {"propertyLabel": "Foreman Password","tag": "input","inputType": "password","property": "foreman_pass"}
                    ];
                    break;
                case "chef":
                    data = [
                        {"propertyLabel": "Client Name","tag": "input","inputType": "text","property": "client_name"},
                        {"propertyLabel": "Client Key","tag": "textarea","inputType": "text","property": "key"}
                    ];
                    break;
                case "salt":
                    data = [
                        {"propertyLabel": "Salt Username","tag": "input","inputType": "text","property": "salt_user"},
                        {"propertyLabel": "Salt Password","tag": "input","inputType": "password","property": "salt_pass"}
                    ];
                    break;
                case "ansible":
                    data = [
                        {"propertyLabel": "Ansible Username","tag": "input","inputType": "text","property": "ansible_user"},
                        {"propertyLabel": "Ansible Password","tag": "input","inputType": "password","property": "ansible_pass"},
                        {"propertyLabel": "AWS Keypair Name","tag": "input","inputType": "text","title": "optional","property": "ansible_aws_keypair"},
                        {"propertyLabel": "SSH Public Key","tag": "textarea","inputType": "text","title": "optional","property": "ansible_ssh_public_key_data"},
                        {"propertyLabel": "SSH Private Key","tag": "textarea","inputType": "text","title": "optional","property": "ansible_ssh_key_data"},
                        {"propertyLabel": "SSH Key Passphrase","tag": "textarea","inputType": "text","title": "optional","property": "ansible_ssh_key_unlock"},
                        {"propertyLabel": "SSH User Name","tag": "input","inputType": "text","title": "optional","property": "ansible_ssh_username"},
                        {"propertyLabel": "SSH Password","tag": "input","inputType": "password","title": "optional","property": "ansible_ssh_password"},
                        {"propertyLabel": "Sudo Username","tag": "input","inputType": "text","title": "optional","property": "ansible_sudo_username"},
                        {"propertyLabel": "Sudo Password","tag": "input","inputType": "password","title": "optional","property": "ansible_sudo_password"}
                    ];
                    break;
            }
            $.each(data, function(index, value) {
                $("#manger_type_specifics").append(ich["manager_type_specifics_template"](value));
            });
        },

        populateManagerSpecifics: function() {
            if(this.configManager) {
                $.each(this.configManager.attributes["auth_properties"], function (key, value) {
                    $("#manager_"+key.toString()).val(value);
                });
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
            var addEditView = this;
            var options = {};
            var issue = false;

            //Get All inputs
            var cmInputs = $("#config_manager_add_edit input,textarea,select");
            $.each(cmInputs, function(index, value) {
                var jQuerySelector = "#" + value.id;
                //If input title is not optional, check it is not blank
                if(value.title !== "optional") {
                    if($(jQuerySelector).val().trim() === "") {
                        addEditView.displayValid(false, jQuerySelector);
                        issue = true;
                    }else {
                        addEditView.displayValid(true, jQuerySelector);
                    }
                }
                //Determine if input name contains a period
                var name_split = value.name.split(".");
                if(name_split.length === 1) {
                    options[name_split[0]] = $(jQuerySelector).val();
                }else if(name_split.length === 2){
                    if(!options[name_split[0]]) {
                        options[name_split[0]] = {};
                    }
                    options[name_split[0]][name_split[1]] = $(jQuerySelector).val();
                }
            });
            options["org_id"] = sessionStorage.org_id;

            if(!issue) {
               if(this.configManager) {
                    this.configManager.update(options);
                }else {
                    this.configManager = new ConfigManager();
                    this.configManager.create(options);
                }
                this.close();
            }else {
                Common.errorDialog("Invalid Request", "Please supply all required fields.");
            }
        }
    });
    
    return ConfigManagerAddEditView;
});
