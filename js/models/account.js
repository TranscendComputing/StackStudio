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
        'common'
], function( $, Backbone, Gh3, Base64, Github, Common ) {
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
                        alert("Bad credentials, please re-enter and try again.");
                    }
            });
        },
        
        login: function(login, password) {
            console.log(this);
        }
    });

    return Account;
});
