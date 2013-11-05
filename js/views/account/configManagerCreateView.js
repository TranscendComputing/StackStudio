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
        'text!templates/account/configManagerCreateTemplate.html',
        'common'
        
], function( $, _, Backbone, ich, DialogView, ConfigManager, managerCreateTemplate, Common ) {
    
    var ConfigManagerCreateView = DialogView.extend({
        model: undefined,
        
        events: {
            "dialogclose": "close",
            "change select": "addAuthFields",
            "change input,textarea,select": "changed"
        },

        initialize: function(options) {
            this.configManagers = options.configManagers;
            this.model = new ConfigManager();
            var createView = this;
            var compiledTemplate = _.template(managerCreateTemplate);

            this.$el.html(compiledTemplate);
            this.$el.dialog({
                autoOpen: true,
                title: "New Configuration Manager",
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
            //Initialize the type value since it won't have a value if the user doesn't change the option
            this.model.set({"type": $("#manager_type_input").val()});
            this.addAuthFields();
        },

        render: function() {

        },

        create: function() {
            var createView = this;
            var issue = false;
            
            $('input, textarea, select').each(function(){
                if($(this).val() === ""){
                    $(this).css("border-color", "red");
                    issue = true;
                }
                else{
                    $(this).css("border-color", "");
                }
            });
            if(!issue){
                this.configManagers.createManager(this.model, {});
                this.closeDialog();
            }else {
                Common.errorDialog("Invalid Request", "Please supply all fields.");
            }
        },
        closeDialog: function(){
            $("#new_config_manager_form")[0].reset();
            this.$el.dialog('close');
        },
        addAuthFields: function(){
            if(!ich["auth_prop_template"]){
                ich.grabTemplates();
            }
            $("#authProp").html("");
            $("#otherAuthProp").html("");
            var toolType = $("#manager_type_input").val().toLowerCase();
            if(toolType){
                var data = {};
                var otherData = {};
                var additionalData = [];
                switch(toolType){
                    case "puppet":
                        data = {"authPropName":"Foreman User", tag:"input", inputType:"text", authProp:"foreman_user"};
                        otherData = {"authPropName":"Foreman Password", tag:"input", inputType:"password",authProp:"foreman_pass"};
                        break;
                    case "chef":
                        data = {"authPropName":"Client Name", tag:"input", inputType:"text",authProp:"client_name"};
                        otherData = {"authPropName":"Key", tag:"textarea", inputType:"text",authProp:"key"};
                        break;
                    case "salt":
                        data = {"authPropName":"Salt Username", tag:"input", inputType:"text",authProp:"salt_user"};
                        otherData = {"authPropName":"Salt Password", tag:"input", inputType:"password",authProp:"salt_pass"};
                        break;
                    case "ansible":
                        data = {"authPropName":"Ansible Username", tag:"input", inputType:"text",authProp:"ansible_user"};
                        otherData = {"authPropName":"Ansible Password", tag:"input", inputType:"password",authProp:"ansible_pass"};
                        additionalData.push(
                          {"authPropName":"Ansible SSH Private Key", tag:"input", 
                          inputType:"textarea", authProp:"ansible_ssh_private_key"});
                        additionalData.push(
                          {"authPropName":"Ansible SSH Key Passphrase", tag:"input", 
                          inputType:"text", authProp:"ansible_ssh_key_passphrase"});
                        additionalData.push(
                          {"authPropName":"Ansible SSH User Name", tag:"input", 
                          inputType:"text", authProp:"ansible_ssh_username"});
                        additionalData.push(
                          {"authPropName":"Ansible SSH Password", tag:"input", 
                          inputType:"text", authProp:"ansible_ssh_password"});
                        break;
                }
                $("#authProp").html(ich["auth_prop_template"](data));
                $("#otherAuthProp").html(ich["auth_prop_template"](otherData));
                // [XXX] There is a better way of doing this
                if (additionalData.length > 0){
                  for (var i in additionalData){
                    $("#additionalAuthProp_"+i).html(
                      ich["auth_prop_template"](additionalData[i]));
                  }
                }
            }
        },
        changed:function(evt) {
            var changed = evt.currentTarget;
            var value = $(evt.currentTarget).val();
            var obj = {};
            var attrs = this.model.attributes;
            if(changed.name.indexOf('.') !== -1){
                attrs["auth_properties"][changed.name.split('.')[1]] = value;
            }else{
                attrs[changed.name] = value;
            }
            this.model.set(attrs);
        }
    });
    
    return ConfigManagerCreateView;
});
