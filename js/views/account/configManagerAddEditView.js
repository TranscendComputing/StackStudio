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
        'collections/continuousIntegrationServers',
        'collections/sourceControlRepositories',
        'text!templates/account/configManagerAddEditTemplate.html',
        'common'
        
], function( $, _, Backbone, ich, DialogView, ConfigManager, ContinuousIntegrationServers, SourceControlRepositories, managerAddEditTemplate, Common ) {
    var ConfigManagerAddEditView = DialogView.extend({
        configManager: undefined,

        events: {
            "dialogclose": "close",
            "change #manager_type_select": "cmTypeChanged",
            "change #manager_continuous_integration_select": "continuousIntegrationChanged"
        },

        initialize: function ( options ) {
            var createView = this;
            this.template = _.template(managerAddEditTemplate);
            this.rootView = options.rootView;
            this.$el.html(this.template);
            this.configManagers = options.configManagers;
            this.ciServers = new ContinuousIntegrationServers();
            this.scRepos = new SourceControlRepositories();
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

                        if(createView.onCreated) {
                            createView.onCreated();
                        }
                    },
                    Cancel: function() {
                        createView.cancel();
                    }
                }
            });
            ich.refresh();
            this.render();

            var thisView = this;
            setTimeout(function () {
                if(thisView.rootView.afterSubAppRender) {
                    thisView.rootView.afterSubAppRender(thisView);
                }
            }, 5);
        },

        render: function() {
            var thisView = this;
            this.ciServers.fetch({
                success:function(collection, response, data){
                    thisView.renderCIs();
                },
                error:function(collection, response, data){
                    Common.errorDialog("Server Error", "Couldn't fetch continuous integration data.");
                },
                reset: true
            });

            this.scRepos.fetch({
                success:function(collection, response, data){
                    thisView.renderSCRepos();
                },
                error:function(collection, response, data){
                    Common.errorDialog("Server Error", "Couldn't fetch source control repository data.");
                },
                reset: true
            });

            if(this.configManager) {
                $("#manager_name_input").val(this.configManager.attributes["name"]);
                $("#manager_url_input").val(this.configManager.attributes["url"]);
                $("#manager_type_select").val(this.configManager.attributes["type"]);
                $("#manager_type_row").hide();
                if(this.configManager.attributes["branch"]) {
                    $("#manager_source_control_branch_input").val(this.configManager.attributes["branch"]);
                }
                if(this.configManager.attributes["source_control_paths"]) {
                    $("#manager_source_control_paths_input").val(this.configManager.attributes["source_control_paths"].join("\n"));
                }
            }
            this.cmTypeChanged();
            this.populateManagerSpecifics();
        },

        renderCIs: function() {
            $("#manager_continuous_integration_select").empty();
            $("#manager_continuous_integration_select").append("<option value='none'>None</option>");
            this.ciServers.each(function(ciServer) {
                $("#manager_continuous_integration_select").append("<option value='" + ciServer.id + "'>" + ciServer.attributes.name + "</option>");
            });

            if(this.configManager && this.configManager.attributes.continuous_integration_servers.length > 0) {
                $("#manager_continuous_integration_select").val(this.configManager.attributes.continuous_integration_servers[0]["continuous_integration_server"]["_id"]);
            } else {
                $("#manager_continuous_integration_select").val("none");
            }
            this.continuousIntegrationChanged();
        },

        renderSCRepos: function() {
            $("#manager_source_control_repo_select").empty();
            $("#manager_source_control_repo_select").append("<option value='none'>Select Repository</option>");
            this.scRepos.each(function(scRepo) {
                $("#manager_source_control_repo_select").append("<option value='" + scRepo.id + "'>" + scRepo.attributes.name + "</option>");
            });

            if(this.configManager && this.configManager.attributes.source_control_repositories.length > 0) {
                $("#manager_source_control_repo_select").val(this.configManager.attributes.source_control_repositories[0]["source_control_repository"]["_id"]);
            } else {
                $("#manager_source_control_repo_select").val("none");
            }
        },

        cmTypeChanged: function() {
            $("#manger_type_specifics").empty();
            var data = [];
            switch($("#manager_type_select").val()) {
                case "puppet":
                    $("#manager_source_control_paths_label").html("Module Paths:");
                    data = [ 
                        {"propertyLabel": "Foreman User","tag": "input","inputType": "text","property": "foreman_user"},
                        {"propertyLabel": "Foreman Password","tag": "input","inputType": "password","property": "foreman_pass"}
                    ];
                    break;
                case "chef":
                    $("#manager_source_control_paths_label").html("Cookbook Paths:");
                    data = [
                        {"propertyLabel": "Client Name","tag": "input","inputType": "text","property": "client_name"},
                        {"propertyLabel": "Client Key","tag": "textarea","inputType": "text","property": "key"}
                    ];
                    break;
                case "salt":
                    $("#manager_source_control_paths_label").html("State Paths:");
                    data = [
                        {"propertyLabel": "Salt Username","tag": "input","inputType": "text","property": "salt_user"},
                        {"propertyLabel": "Salt Password","tag": "input","inputType": "password","property": "salt_pass"}
                    ];
                    break;
                case "ansible":
                    $("#manager_source_control_paths_label").html("Job Paths:");
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

        continuousIntegrationChanged: function() {
            if($("#manager_continuous_integration_select").val() === "none") {
                $(".source_control_row").hide();
            }else {
                $(".source_control_row").show();
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

            options["org_id"] = Common.account.org_id;

            //Get All inputs
            var cmInputs = $("#config_manager_add_edit input,textarea,select");
            $.each(cmInputs, function(index, value) {
                // Ignore special cases and handle after loop
                if(value.name !== "continuous_integration_id" && value.className !== "source_control_property")
                {
                    var jQuerySelector = "#" + value.id;
                    //If input title is not optional, check it is not blank
                    if(value.title !== "optional" && $(jQuerySelector).is(":visible")) {
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
                }
            });

            if($("#manager_continuous_integration_select").val() === "none") {
                options["continuous_integration_server_ids"] = [];
                options["source_control_repository_ids"] = [];
                options["branch"] = "";
                options["source_control_paths"] = "";
            } else {
                if($("#manager_source_control_repo_select").val() === "none") {
                    addEditView.displayValid(false, "#manager_scm_select");
                    issue = true;
                } else {
                    addEditView.displayValid(true, "#manager_scm_select");
                    options["continuous_integration_server_ids"] = [$("#manager_continuous_integration_select").val()];
                    options["source_control_repository_ids"] = [$("#manager_source_control_repo_select").val()];
                }

                if($("#manager_source_control_branch_input").val().trim() === "") {
                    addEditView.displayValid(false, "#manager_source_control_branch_input");
                    issue = true;
                } else {
                    addEditView.displayValid(true, "#manager_source_control_branch_input");
                    options["branch"] = $("#manager_source_control_branch_input").val();
                }

                if($("#manager_source_control_paths_input").val().trim() === "") {
                    addEditView.displayValid(false, "#manager_source_control_paths_input");
                    issue = true;
                } else {
                    addEditView.displayValid(true, "#manager_source_control_paths_input");
                    options["source_control_paths"] = $("#manager_source_control_paths_input").val().trim().split("\n");
                }
            }

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
