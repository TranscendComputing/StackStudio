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
        'text!templates/account/managementTemplate.html',
        'views/account/cloudAccountManagementView',
        'views/account/cloudCredentialManagementView',
        'views/account/usersManagementView',     
        'jquery-plugins',
        'jquery-ui-plugins'
], function( $, _, Backbone, Common, managementTemplate, CloudAccountManagementView, CloudCredentialManagementView, UsersManagementView ) {

    var AccountManagementView = Backbone.View.extend({
        /** @type {String} DOM element to attach view to */
        el: "#main",
        /** @type {Template} HTML template to generate view from */
        template: _.template(managementTemplate),
        /** @type {Object} Object of events for view to listen on */
        events: {
            
        },
        subApp: undefined,
        /** Constructor method for current view */
        initialize: function() {
            this.subViews = [];
            //Render my own view
            this.render();
        },
        /** Add all of my own html elements */
        render: function () {
            //Render my template
            this.$el.html(this.template);
            $("ul#account_management_menu").menu({role: "listbox"});
        },
        close: function(){
            this.$el.empty();
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            // handle other unbinding needs, here
            _.each(this.subViews, function(childView){
              if (childView.close){
                childView.close();
              }
            });
        }
    });

    /** Variable to track whether view has been initialized or not */
    var accountManagementView;

    Common.router.on("route:accountManagement", function (action) {
        if (this.previousView !== accountManagementView) {
            this.unloadPreviousState();
            accountManagementView = new AccountManagementView();
            this.setPreviousState(accountManagementView);
        }
        switch(action)
        {
            case "cloud-accounts":
                if(accountManagementView.subApp instanceof CloudAccountManagementView)
                {
                    //do nothing
                }else{
                    if(accountManagementView.subApp !== undefined){
                        accountManagementView.subApp.close();
                    }
                    accountManagementView.subApp = new CloudAccountManagementView();
                }
                break;
            case "cloud-credentials":
                if(accountManagementView.subApp instanceof CloudCredentialManagementView)
                {
                    //do nothing
                }else{
                    if(accountManagementView.subApp !== undefined){
                        accountManagementView.subApp.close();
                    }
                    accountManagementView.subApp = new CloudCredentialManagementView();
                }
                break;
            case "users":
                if(accountManagementView.subApp instanceof UsersManagementView)
                {
                    //do nothing
                }else{
                    if(accountManagementView.subApp !== undefined){
                        accountManagementView.subApp.close();
                    }
                    accountManagementView.subApp = new UsersManagementView();
                }
                break;
        }
    }, Common);

    return AccountManagementView;
});
