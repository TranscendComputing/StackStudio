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
        'text!templates/account/userUpdateTemplate.html',
        'collections/countries',
        'models/user',
        'common',
        'messenger'      
], function( $, _, Backbone, DialogView, UserUpdateTemplate, Countries, User, Common, Messenger ) {
    
    var NewUserUpdateView = DialogView.extend({

        template: _.template(UserUpdateTemplate),

        orgId: undefined,
        
        countries: undefined,

        events: {
            "dialogclose": "close",
            "click #change_password": "clickChangePassword"
        },

        initialize: function(options) {
            this.$el.html( this.template );
            var userUpdateView = this;
            this.$el.dialog({
                title: "Update User",
                autoOpen: true,
                width:500,
                minHeight: 150,
                resizable: false,
                modal: true,
                buttons: [
                    {
                        text: "Update",
                        click: function() {
                            userUpdateView.update();
                        }
                    },
                    {
                        text: "Cancel",
                        click: function() {
                            userUpdateView.cancel();
                        }
                    }
                ]
            });
            this.countries = new Countries();
            this.countries.on( 'reset', this.addAllCountries, this );
            this.countries.fetch({reset: true});
            if(options && options.org_id) {
                this.orgId = options.org_id;
            }
            this.userSelected = options.user;
            this.render();
        },

        render: function() {
            var userUpdateView = this;
            this.populateForm(userUpdateView.userSelected);
            this.disableInput(".password",true);
            this.update_password = false;
        },

        populateFormHelper: function(p,form){
            for (var key in p) {
              if (p.hasOwnProperty(key)) {
                var typ = $( form + " input[name='"+key+"']" ).prop("type");
                if(typ === "checkbox"){
                    if(typeof p[key] === 'string'){
                        $( form + " input[name='"+key+"'][value='"+p[key]+"']" ).attr('checked','checked');
                    }else{
                        for (var i in p[key]) {
                          $( form + " input[name='"+key+"'][value='"+p[key][i]+"']" ).attr('checked','checked');
                        }
                    }
                }else if(typ === "radio"){
                    $( form + " input[name='"+key+"'][value='"+p[key]+"']" ).attr('checked','checked');
                }else{
                    $("#"+key).val(p[key]);
                }
              }
            }
            if(p.permissions.length > 0){
                if(p.permissions[0].permission.name === "admin"){
                    $("#admin_checkbox").attr('checked', true);
                }
            }
            else{
                $("#admin_checkbox").removeAttr('checked');
            }
        },
        populateForm: function(model){
            this.populateFormHelper(model.attributes,"#new_user_form");
        },

        disableInput: function(id,toggle) {
            if(toggle) {
                $(id).attr("disabled", true);
                $(id).addClass("ui-state-disabled");
            }else {
                $(id).removeAttr("disabled");
                $(id).removeClass("ui-state-disabled");
            }
        },
        
        addAllCountries: function() {
            this.countries.each(function(country) {
                $("#country_id").append("<option value='"+country.attributes.code+"'>"+country.attributes.name+"</option");
            });
        },
        
        clickChangePassword: function(event){
            if($(event.target).is(":checked")){
                this.disableInput(".password",false);
                this.update_password = true;
            }else{
                this.disableInput(".password",true);
                this.update_password = false;
            }
        },
        update: function() {
            // Validation Process
            var issue = false;

            if($("#login").val() === "") {
                issue = true;
            }
            
            if($("#email").val() === "") {
                issue = true;
            }
            if(this.update_password){
                if($("#new_password").val() === "" || $("#confirm_password").val() === "") {
                    issue = true;
                }else {
                    if($("#new_password").val() !== $("#confirm_password").val()) {
                        issue = true;
                    }
                }
            }

            if(!issue) {
                var userUpdate;
                if(this.orgId) {
                    userUpdate = {
                        "account":{
                            "login": $("#login").val(),
                            "first_name": $("#first_name").val(),
                            "last_name": $("#last_name").val(),
                            "org_id": this.orgId,
                            "email": $("#email").val(),
                            "country_code": $("#country_id").val()
                        },
                        "permissions":{
                            "admin_login": sessionStorage.login
                        }

                    };
                }else {
                   userUpdate = {
                        "account":{
                            "login": $("#login").val(),
                            "first_name": $("#first_name").val(),
                            "last_name": $("#last_name").val(),
                            "email": $("#email").val(),
                            "country_code": $("#country_id").val()
                        },
                        "permissions":{
                            "admin_login": sessionStorage.login
                        }

                    }; 
                }
                if(this.update_password){
                    userUpdate.account.password = $("#new_password").val();
                    userUpdate.account.password_confirmation = $("#confirm_password").val();
                }
                var adminPermissions = $("#admin_checkbox").is(":checked");
                this.userSelected.updateAttributes(userUpdate, adminPermissions);
                this.$el.dialog('close');
            }else {
                Common.errorDialog("Invalid Request", "Please supply all required fields.");
            }
        }
    });
    
    return NewUserUpdateView;
});
