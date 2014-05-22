/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true requirejs:true require:true*/
define([
        'jquery',
        'underscore',
        'backbone',
        'common',
        'text!templates/account/homeTemplate.html'
    ],
    function ( $, _, Backbone, Common, homeTemplate ) {

        var AccountManagementView = Backbone.View.extend({

            template: _.template(homeTemplate),
            /** @type {Object} Object of events for view to listen on */
            events: {
                "click #addUser": "addUser"
            },
            subApp: undefined,
            tree: undefined,
            groups: undefined,
            cloudCredentials: undefined,
            cloudAccounts: undefined,
            policies: undefined,
            treeGroup: undefined,
            treeCloudAccount: undefined,
            treeCloudCred: undefined,
            treePolicy: undefined,
            afterSubAppRender: undefined,

            /** Constructor method for current view */
            initialize: function(options) {
                //Render my template
                this.$el.html(this.template);
    
                this.groups = new Groups();
                this.groups.on('reset', this.addAllGroups, this);
    
                this.cloudCredentials = new CloudCredentials();
                this.cloudCredentials.on( 'reset', this.addAllCreds, this );

                this.cloudCredentials.fetch({
                    data: $.param({ org_id: sessionStorage.org_id, account_id: sessionStorage.account_id}),
                    reset: true
                });
    
                this.cloudAccounts = new CloudAccounts();
                this.cloudAccounts.on( 'reset', this.addAllCloudAccounts, this );
    
                this.policies = new Policies();
                this.policies.on( 'reset', this.addAllPolicies, this );
    
                //Render my own views
                this.render();

                if (sessionStorage && parseInt(sessionStorage.num_logins, 10) < 5)  {//todo: change this to 0
                    this.tutorial = new TutorialView({ rootView: this });
    
                    this.afterSubAppRender = function () {
                        this.tutorial.update();
                    }.bind(this);
    
                    this.tutorial.render();
                }
                window.jQuery = $;
                window.$ = $;
            },

            /** Add all of my own html elements */
            render: function () {
                this.$el.html(this.template);
                $('#main').html(this.$el);
            }
        });

        Common.router.on('route:account/management', function () {
            if(sessionStorage.account_id) {
                var accountView = new AccountManagementView();
            } else {
                Common.router.navigate("", {trigger: true});
                Common.errorDialog("Login Error", "You must login.");
            }
        });

        return AccountManagementView;
    }
);
