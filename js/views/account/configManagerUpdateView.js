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
        'text!templates/account/configManagerUpdateTemplate.html',
        'common'
        
], function( $, _, Backbone, ich, DialogView, ConfigManager, managerUpdateTemplate, Common ) {
    
    var ConfigManagerUpdateView = DialogView.extend({
        model: undefined,
        
        events: {
            "dialogclose": "close",
            "change select": "addAuthFields",
            "change input,textarea,select": "changed"
        },

        initialize: function(options) {
            this.configManager = options.configManager;
            var updateView = this;
            var compiledTemplate = _.template(managerUpdateTemplate);

            this.$el.html(compiledTemplate);
            this.$el.dialog({
                autoOpen: true,
                title: "Edit Configuration Manager",
                resizable: false,
                width: 325,
                modal: true,
                buttons: {
                    Save: function () {
                        updateView.configManager.save({}, {
                            success: function(){
                                Common.vent.trigger("devOpsViewRefresh");
                            }
                        });
                        updateView.close();
                    },
                    Cancel: function() {
                        updateView.close();
                    }
                }
            });

            this.populateFields();
        },

        render: function() {

        },
        edit: function(){

        },

        closeDialog: function(){
            $("#new_config_manager_form")[0].reset();
            this.$el.dialog('close');
        },
        populateFields: function(){

            var $this = this;

            if(!ich["auth_prop_template"]){
                ich.grabTemplates();
            }
            $("#authProp").html("");
            $("#otherAuthProp").html("");
            var data = {};
            var otherData = {};
            var additionalData = [];
            if($this.configManager.get("type").toLowerCase() === "puppet"){

                data = {"authPropName":"Foreman User", tag:"input", inputType:"text",authProp:"foreman_user"};
                $("#authProp").html(ich["auth_prop_template"](data));

                data = {"authPropName":"Foreman Password", tag:"input", inputType:"password",authProp:"foreman_pass"};
                $("#otherAuthProp").html(ich["auth_prop_template"](data));

            }else if ($this.configManager.get("type").toLowerCase() === "chef"){
                data = {"authPropName":"Client Name", tag:"input", inputType:"text",authProp:"client_name"};
                $("#authProp").html(ich["auth_prop_template"](data));

                data = {"authPropName":"Key", tag:"textarea", inputType:"text",authProp:"key"};
                $("#otherAuthProp").html(ich["auth_prop_template"](data));
            } else if ($this.configManager.get("type").toLowerCase() === "ansible"){
              data = {"authPropName":"Ansible Username", tag:"input", inputType:"text",authProp:"ansible_user"};
              otherData = {"authPropName":"Ansible Password", tag:"input", inputType:"password",authProp:"ansible_pass"};
              additionalData.push(
                {"authPropName":"AWS Keypair Name", tag:"input", 
                inputType:"text", authProp:"ansible_aws_keypair"});
              additionalData.push(
                {"authPropName":"SSH Public Key", tag:"textarea", 
                inputType:"text",  authProp:"ansible_ssh_public_key_data"});
              additionalData.push(
                {"authPropName":"SSH Private Key", tag:"textarea", 
                inputType:"text", authProp:"ansible_ssh_key_data"});
              additionalData.push(
                {"authPropName":"SSH Key Passphrase", tag:"input", 
                inputType:"password", authProp:"ansible_ssh_key_unlock"});
              additionalData.push(
                {"authPropName":"SSH User Name", tag:"input", 
                inputType:"text", authProp:"ansible_ssh_username"});
              additionalData.push(
                {"authPropName":"SSH Password", tag:"input", 
                inputType:"password", authProp:"ansible_ssh_password"});
              additionalData.push(
                {"authPropName":"Sudo Username", tag:"input", 
                inputType:"text", authProp:"ansible_sudo_username"});
              additionalData.push(
                {"authPropName":"Sudo Password", tag:"input", 
                inputType:"password", authProp:"ansible_sudo_password"});
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
            $("#update_config_manager_form :input").each(function() {
                if(this.name.indexOf("auth_properties") !== -1){
                    var attr = this.name.split(".").pop();
                    this.value = $this.configManager.get("auth_properties")[attr];
                }
                else{
                    this.value = $this.configManager.get(this.name);
                }
            });
        },
        changed:function(evt) {
            var changed = evt.currentTarget;
            var value = $(evt.currentTarget).val();
            var obj = {};
            var attrs = this.configManager.attributes;
            if(changed.name.indexOf('.') !== -1){
                attrs["auth_properties"][changed.name.split('.')[1]] = value;
            }else{
                attrs[changed.name] = value;
            }
            this.configManager.set(attrs);
        },
        close: function(){
            this.$el.empty();
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            this.cancel();
        }
    });
    
    return ConfigManagerUpdateView;
});
