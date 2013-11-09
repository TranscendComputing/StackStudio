/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true alert:true*/
define([
        'jquery',
        'backbone',
        'gh3',
        'base64',
        'github',
        'common',
        'messenger'
], function( $, Backbone, Gh3, Base64, Github, Common, Messenger) {
    'use strict';

    // Account Model
    // ----------

    /**
     * Our basic **Project** model has `name`
     *
     * @name Project
     * @constructor
     * @category Projects
     * @param {Object} initialization object.
     * @returns {Object} Returns a Project instance.
     */
    var Account = Backbone.Model.extend({

        /** Default attributes for the project */
        defaults: {
            login: '',
            password: '',
            email: '',
            subscriptions: [],
            projectMemberships: [],
            auth: 'basic'
        },

        /**
         * Override the base Backbone set method, for debugging.
         *
         * @memberOf Project
         * @category Internal
         * @param {Object} hash of attribute values to set.
         * @param {Object} (optional) options to tweak (see Backbone docs).
         */
        set: function(attributes, options) {
            Backbone.Model.prototype.set.apply(this, arguments);
            //console.log("Setting attributes on model:", attributes);
        },
        
        githubLogin: function(login, password) {
            Common.github = new Github({
                username: login,
                password: password,
                auth: this.get('auth')
            });
            var templatesRepo = Common.github.getRepo("TranscendComputing", "CloudFormationTemplates");
            templatesRepo.getTree('master?recursive=true', function(err, tree) {
                    if (err === null || err === undefined) {
                        Common.vent.trigger("account:login");
                    } else {
                        Common.errorDialog("Bad Credentials", "Please re-enter and try again.");
                    }
            });
        },
        
        getUser: function(){
            var url = Common.apiUrl + "/identity/v1/accounts/" + sessionStorage.account_id +".json";
            $.ajax({
                url: url,
                type: 'GET',
                contentType: 'application/x-www-form-urlencoded',
                success: function(data) {
                    Common.vent.trigger("accountUpdate",data);
                },
                error: function(jqXHR) {
                    Common.errorDialog(jqXHR.statusText, jqXHR.responseText);
                }
            });
        },
        
        setUser: function(options){
            var url = Common.apiUrl + "/identity/v1/accounts/" + sessionStorage.account_id + "/update?_method=PUT";
            $.ajax({
                url: url,
                type: "POST",
                contentType: 'application/x-www-form-urlencoded',
                dataType: 'json',
                data: JSON.stringify(options),
                success: function(data) {
                    sessionStorage.rss_url = data.rss_url;
                    new Messenger().post({type:"success", message:"User Updated..."});
                },
                error: function(jqXHR) {
                    Common.errorDialog(jqXHR.statusText, jqXHR.responseText);
                }
            });
        },
        
        login: function(login, password) {
            console.log(this);
        }
    });

    return Account;
});
