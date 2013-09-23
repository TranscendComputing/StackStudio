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
            var data = {};
            if($("#manager_type_input").val().toLowerCase() === "puppet"){

                data = {"authPropName":"Foreman User", tag:"input", inputType:"text", authProp:"foreman_user"};
                $("#authProp").html(ich["auth_prop_template"](data));

                data = {"authPropName":"Foreman Password", tag:"input", inputType:"password",authProp:"foreman_pass"};
                $("#otherAuthProp").html(ich["auth_prop_template"](data));

            }else if ($("#manager_type_input").val().toLowerCase() === "chef"){
                data = {"authPropName":"Client Name", tag:"input", inputType:"text",authProp:"client_name"};
                $("#authProp").html(ich["auth_prop_template"](data));

                data = {"authPropName":"Key", tag:"textarea", inputType:"text",authProp:"key"};
                $("#otherAuthProp").html(ich["auth_prop_template"](data));
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
