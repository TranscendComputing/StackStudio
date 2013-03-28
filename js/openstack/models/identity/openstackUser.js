/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true */
define([
        'jquery',
        'underscore',
        'backbone',
        'common'
], function( $, _, Backbone, Common ) {
    'use strict';

    Backbone.emulateHTTP = true;
    Backbone.emulateJSON = true;

    // Base User Model
    // ----------

    /**
     *
     * @name User
     * @constructor
     * @category Identity
     * @param {Object} initialization object.
     * @returns {Object} Returns a User instance.
     */
    var User = Backbone.Model.extend({

        validate: function(attrs, options) {
            var required = ["password", "passwordConfirmation", "email", "name"],
                requiredError;

            _.each(required, function(req){
                if(attrs[req] === null || attrs[req] === "" || attrs[req] === undefined)
                {
                    if(requiredError)
                    {
                        requiredError = requiredError + ", " + req;
                    }else{
                        requiredError = req;
                    }
                    return;
                }
            }, this);
            if(requiredError)
            {
                this.validationError = requiredError + " must not be blank.";
                return requiredError;
            }

            if(attrs.tenant_id === null || attrs.tenant_id === "" || attrs.tenant_id === undefined)
            {
                this.validationError = "Must select a Primary Project.";
                return "Must select a Primary Project.";
            }

            if (attrs.password !== attrs.passwordConfirmation) {
                this.validationError = "Password and Password Confirmation do not match.";
                return "Password and Password Confirmation do not match.";
            }

            // Check valid email
            var atpos=attrs.email.indexOf("@");
            var dotpos=attrs.email.lastIndexOf(".");
            if (atpos<1 || dotpos<atpos+2 || dotpos+2>=attrs.email.length)
            {
                this.validationError = "Not a valid e-mail address";
                return "Not a valid e-mail address";
            }

            //If all is valid, remove the passwordConfirmation before saving
            delete attrs["passwordConfirmation"];
        },
        
        create: function(credentialId, region) {
            var url = "?cred_id=" + credentialId + "&region=" + region;
            this.sendPostAction(url, {user: this.attributes});
        },

        destroy: function(credentialId, region) {
            var url = "?_method=DELETE&cred_id=" + credentialId + "&region=" + region;
            this.sendPostAction(url);
        },
        
        sendPostAction: function(url, options, trigger) {
            //Set default values for options and trigger if nothing is passed
            options = typeof options !== 'undefined' ? options : {};
            trigger = typeof trigger !== 'undefined' ? trigger : "userAppRefresh";
            $.ajax({
                url: this.url() + url,
                type: 'POST',
                contentType: 'application/x-www-form-urlencoded',
                dataType: 'json',
                data: JSON.stringify(options),
                success: function(data) {
                    Common.vent.trigger(trigger);
                },
                error: function(jqXHR) {
                    Common.errorDialog(jqXHR.statusText, jqXHR.responseText);
                }
            }); 
        },

        sync: function() {
            return false;
        }
    });

    return User;
});
