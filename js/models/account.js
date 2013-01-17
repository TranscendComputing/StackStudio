/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true */
define([
        'jquery',
        'backbone',
        'gh3',
        'base64'
], function( $, Backbone, Gh3, Base64 ) {
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
            username: '',
            password: '',
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
        
        login: function() {
            /*
            var auth = this.makeBasicAuth(this.get('username'), this.get('passsword'));
            console.log(auth);
            var data = $.ajax({
                url: "https://api.github.com",
                dataType: 'json',
                type: 'post',
                beforeSend: function(req) {
                    req.setRequestHeader('Authorization', auth);
                    console.log("Request", req);
                },
                success: function(data) {
                    console.log(data);
                }
            });
            */
           var user = new Gh3.User(this.get('username'));
           console.log(user);
           user.fetch(function(err, resUser){
               if (err) {
                   console.log("Error...", err);
               }
           });
           
           var repos = new Gh3.Repositories(user);
           repos.fetch({page:1}, "next", function(err,res) {
               if (err) {console.log("Error....", err);}
               console.log("Repositories", repos);
           });
        },
        
        makeBasicAuth: function(username, password) {
            var token = username + ":" + password;
            var hash = Base64.encode(token);
            return "Basic " + hash;
        }

    });

    return Account;
});
