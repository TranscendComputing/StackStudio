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
        'icanhaz',
        'URIjs/URI',
        'text!templates/account/managementCloudAccountTemplate.html',
        'collections/cloudAccounts',
        'collections/users',
        'views/account/cloudAccountCreateView',
        'views/account/cloudServiceCreateView',
        'models/cloudService',
        'jquery-plugins',
        'jquery-ui-plugins'
], function( $, _, Backbone, Common, ich, URI, managementCloudAccountTemplate, CloudAccounts, Users, CloudAccountCreate, CloudServiceCreate, CloudService ) {

    var CloudAccountManagementView = Backbone.View.extend({
        /** @type {String} DOM element to attach view to */
        el: "#submanagement_app",
        /** @type {Collection} Database collection of cloud accounts */
        collection: new CloudAccounts(),
        users: new Users(),
        /** @type {Template} HTML template to generate view from */
        template: _.template(managementCloudAccountTemplate),
        CloudAccountCreateView: CloudAccountCreate,
        CloudServiceCreateView: CloudServiceCreate,
        rootView: undefined,
        /** @type {Object} Object of events for view to listen on */
        events: {
            "click button.save-button": "saveService",
            "click button#new_cloud_service": "newCloudService",
            "click button#delete_cloud_account": "deleteCloudAccount",
            "click button.delete-button": "deleteService"
        },
        /** Constructor method for current view */
        initialize: function() {
            
            this.rootView = this.options.rootView;
            //this.rootView.treeCloudAccount = this.rootView.cloudAccounts
            //var whatisthis = this.rootView.cloudAccounts;
            //debugger
            
            
            this.childViews = [];
            //Add listeners and fetch db for collection
            //this.collection.on( 'add', this.addOne, this );
            //this.collection.on( 'reset', this.addAll, this );
            
            this.collection = this.rootView.cloudAccounts;

            /**
             * Perhaps the single most common JavaScript "gotcha" is the fact that when 
             * you pass a function as a callback, its value for this is lost. With 
             * Backbone, when dealing with events and callbacks, you'll often find it 
             * useful to rely on _.bind and _.bindAll from Underscore.js.
             * 
             * http://backbonejs.org/#FAQ-this
             */
            this.collection.fetch({ 
                data: $.param({ org_id: sessionStorage.org_id, account_id: sessionStorage.account_id}),
                success: _.bind(this.renderAccountAttributes, this),
                reset: true
            });
            //Render my own view
            this.render();
            
            var managementView = this;
            Common.vent.on("managementRefresh", function() {
                managementView.refreshManagementView();
            });
            Common.vent.on("servicesRefresh", function() {
                managementView.refreshServices();
            });
        },
        /** Add all of my own html elements */
        render: function () {
            //Render my template
            this.$el.append(this.template);
            //$("ul#cloud_account_list").menu();
            //$("div#detail_tabs").tabs();
        },

        renderAccountAttributes: function() {
            /**
             * [ich.grabTemplates() description]
             * 
             * Looks for any <script type="text/html"> tags to make templates out of. 
             * Then removes those elements from the dom (this is the method that runs 
             * on document ready when ich first inits).
             */
            
            if(!ich.templates.cloud_service){
                ich.grabTemplates();
            }
            
            var services = ich['cloud_service'](this.selectedCloudAccount.attributes);
            $('#services_page').html(services);
            
            $('button').button();
            
            this.adminCheck();
        },
        
        adminCheck: function(){
            var groupsView = this;
            groupsView.users.fetch({success: function(){
                var isAdmin = false;
                if(groupsView.users.get(sessionStorage.account_id).attributes.permissions.length > 0){
                    isAdmin = groupsView.users.get(sessionStorage.account_id).attributes.permissions[0].permission.name === "admin";
                }
                if(!isAdmin){
                    $(".delete-button").attr("disabled", true);
                    $(".delete-button").addClass("ui-state-disabled");
                    $(".delete-button").removeClass("ui-state-hover");
                    $(".save-button").attr("disabled", true);
                    $(".save-button").addClass("ui-state-disabled");
                    $("#new_cloud_service").attr("disabled", true);
                    $("#new_cloud_service").addClass("ui-state-disabled");
                }
            }});
        },
        
        treeSelectCloudAccount: function() {
            //this.clearSelection();
            this.selectedCloudAccount = this.rootView.cloudAccounts.get(this.rootView.treeCloudAccount);
            $("#services_tab").html(this.selectedCloudAccount.attributes.name);
            $("#cloud_provider_label").html(this.selectedCloudAccount.attributes.cloud_provider);
            this.renderAccountAttributes();
        },

        saveService: function(event) {
            var uri, service;
            var endpointValue = $(event.currentTarget.parentElement).find("input").val();
            var inputData = $(event.currentTarget.parentElement).find("input").data();
            uri = URI.parse(endpointValue);
            service = new CloudService(uri);
            service.set({
                host: uri.hostname,
                service_type: inputData.name,
                id: inputData.id
            });
            service.unset("password");
            service.unset("username");
            this.selectedCloudAccount.updateService(service);
            return false;
        },
        
        newCloudService: function(){
            var CloudServiceCreateView = this.CloudServiceCreateView;
            
            this.newResourceDialog = new CloudServiceCreateView({ cloud_account: this.selectedCloudAccount});
            
            this.newResourceDialog.render();
            
        },

        deleteService: function(event) {
            var serviceData = $(event.currentTarget.parentElement).find("input").data();
            this.selectedCloudAccount.deleteService(serviceData);
            
            this.refreshServices();
            
            return false;
        },

        close: function(){
            this.$el.empty();
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            // handle other unbinding needs, here
            _.each(this.childViews, function(childView){
              if (childView.close){
                childView.close();
              }
            });
        },
        
        refreshManagementView: function(){
            this.collection.fetch({ 
                data: $.param({ org_id: sessionStorage.org_id, account_id: sessionStorage.account_id}),
                success: _.bind(this.renderAccountAttributes, this),
                reset: true

            });
        },
        
        refreshServices: function(){
            this.collection.fetch({ 
                data: $.param({ org_id: sessionStorage.org_id, account_id: sessionStorage.account_id}),
                success: _.bind(this.renderAccountAttributes, this)
            });
        },
        
        deleteCloudAccount: function(){
            var cl_ac = this.selectedCloudAccount.destroy();
        },
        
        close: function(){
            console.log(this.$el);
            //this.$el.remove()
        } 
    });

    return CloudAccountManagementView;
});
