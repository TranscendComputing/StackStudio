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
        'models/cloudService',
        'jquery-plugins',
        'jquery-ui-plugins'
], function( $, _, Backbone, Common, ich, URI, managementCloudAccountTemplate, CloudAccounts, CloudService ) {

    var CloudAccountManagementView = Backbone.View.extend({
        /** @type {String} DOM element to attach view to */
        el: "#submanagement_app",
        /** @type {Collection} Database collection of cloud accounts */
        collection: new CloudAccounts(),
        /** @type {Template} HTML template to generate view from */
        template: _.template(managementCloudAccountTemplate),
        /** @type {Object} Object of events for view to listen on */
        events: {
            "click .list_item": "selectCloudAccount",
            "click button.save-button": "saveService",
            "click button#new_cloud_account": "newCloudAccount",
            "click button.delete-button": "deleteService"
        },
        /** Constructor method for current view */
        initialize: function() {
            this.childViews = [];
            //Add listeners and fetch db for collection
            this.collection.on( 'add', this.addOne, this );
            this.collection.on( 'reset', this.addAll, this );

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
        },
        /** Add all of my own html elements */
        render: function () {
            //Render my template
            this.$el.append(this.template);
            $("ul#cloud_account_list").menu();
            $("div#detail_tabs").tabs();
        },

        renderAccountAttributes: function() {
            /**
             * [ich.grabTemplates() description]
             * 
             * Looks for any <script type="text/html"> tags to make templates out of. 
             * Then removes those elements from the dom (this is the method that runs 
             * on document ready when ich first inits).
             */
            ich.grabTemplates();
            var services = ich['cloud_service'](this.selectedCloudAccount.attributes);
            $('#services_page').html(services);
            $('button').button();
        },

        addOne: function(model) {
            console.log(model);
            $("#cloud_account_list").prepend("<li class='list_item' id='"+model.attributes.name+"'>"+model.attributes.name+"</li>");
            this.selectedCloudAccount = model;
        },

        addAll: function() {
            console.log(this.collection);
            $("#cloud_account_list").empty();            
            this.collection.each(this.addOne, this);
        },

        selectCloudAccount: function(event) {
            this.clearSelection();
            $(event.target).addClass("selected_item");
            this.selectedCloudAccount = this.collection.where({name: event.target.id})[0];
            this.renderAccountAttributes();
        },

        clearSelection: function() {
            $("#cloud_account_list li").each(function() {
               $(this).removeClass("selected_item");
            });
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

        newCloudAccount: function(){
            
        },

        deleteService: function(event) {
            var serviceData = $(event.currentTarget.parentElement).find("input").data();
            this.selectedCloudAccount.deleteService(serviceData);
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
        } 
    });

    return CloudAccountManagementView;
});
