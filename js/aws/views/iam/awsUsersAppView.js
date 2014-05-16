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
        'views/resource/resourceAppView',
        'text!templates/aws/iam/awsUserAppTemplate.html',
        '/js/aws/models/iam/awsUser.js',
        '/js/aws/collections/iam/awsUsers.js',
        '/js/aws/views/iam/awsUserCreateView.js',
        '/js/aws/views/iam/awsUserKeyDisplayView.js',
        'icanhaz',
        'common'
], function( $, _, Backbone, ResourceAppView, UserAppTemplate, User, Users, UserCreateView, UserDisplayKeyView, ich, Common ) {
    'use strict';

    var AwsUsersAppView = ResourceAppView.extend({

        template: _.template(UserAppTemplate),
        
        modelStringIdentifier: "id",
        
        columns: ["id"],
        
        idColumnNumber: 0,
        
        model: User,
        
        collectionType: Users,

        type: "iam",
        
        subtype: "users",

        CreateView: UserCreateView,
        
        events: {
            'click .create_button': 'createNew',
            'click #action_menu ul li': 'performAction',
            'click #resource_table tr': "clickOne"
        },

        actions: [
            { text: "Delete User", type: "row" }
        ],

        initialize: function(options) {
            if(options.cred_id) {
                this.credentialId = options.cred_id;
            }
            if(options.region) {
                this.region = options.region;
            }
            this.$el.html(this.template);
            this.loadData({ render: true });
            
            var userApp = this;
            Common.vent.off("userAppRefresh");
            Common.vent.on("userAppRefresh", function() {
                userApp.render();
            });
            Common.vent.off("userKeysGenerated");
            Common.vent.on("userKeysGenerated", function(accessKeyData) {
                userApp.accessKeyDialog(accessKeyData);
            });
        },
        
        toggleActions: function(e) {
            //Disable any needed actions
        },
        
        performAction: function(event) {
            var user = this.collection.get(this.selectedId);
            
            switch(event.target.text)
            {
            case "Delete User":
                user.destroy(this.credentialId, this.region);
                break;
            }
        },

        accessKeyDialog: function(accessKeyData) {
            new UserDisplayKeyView(accessKeyData);
        }
    });
    
    return AwsUsersAppView;
});
