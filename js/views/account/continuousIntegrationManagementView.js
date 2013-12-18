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
        'text!templates/account/managementContinuousIntegrationTemplate.html',
        'collections/continuousIntegrationServers',
        'views/account/continuousIntegrationServerAddEditView',
        'jquery-plugins',
        'jquery-ui-plugins'
], function( $, _, Backbone, Common, ich, managementContinuousIntegrationTemplate, CIServers, CIServerAddEditView ) {

    var ContinuousIntegrationManagementView = Backbone.View.extend({
        /** @type {String} DOM element to attach view to */
        el: "#submanagement_app",
        template: undefined,
        rootView: undefined,
        ciServers: undefined,

        events: {
            "click #new_ci_server": "newCI",
            "click button.edit-ci-server-button" : "editCI",
            "click button.delete-ci-server-button": "deleteCI"
        },

        /** Constructor method for current view */
        initialize: function(options) {
            this.template = _.template(managementContinuousIntegrationTemplate);
            this.$el.html(this.template);
            this.rootView = options.rootView;
            this.ciServers = new CIServers();
            
            var ciManagementView = this;
            Common.vent.off("CIServerCreated");
            Common.vent.on("CIServerCreated", function() {
                ciManagementView.render();
            });
            Common.vent.off("CIServerUpdated");
            Common.vent.on("CIServerUpdated", function() {
                ciManagementView.render();
            });
            Common.vent.off("CIServerDeleted");
            Common.vent.on("CIServerDeleted", function() {
                ciManagementView.render();
            });

            ich.refresh();
            this.render();
        },

        render: function () {
            var thisView = this;
            this.ciServers.fetch({
                success:function(collection, response, data){
                    thisView.renderCIs();
                },
                error:function(collection, response, data){
                    Common.errorDialog("Server Error", "Couldn't fetch continuous integration data.");
                },
                reset: true
            });
        },

        renderCIs: function() {
            if(typeof(ich['ci_template']) === 'undefined'){
                ich.grabTemplates();
            }
            var jenkinsEndpoints = [];
            var otherEndpoints = [];
            this.ciServers.each(function(ciServer) {
                ciServer = ciServer.attributes;
                if(ciServer["type"] === "jenkins") {
                    jenkinsEndpoints.push(ciServer);
                }else {
                    otherEndpoints.push(ciServer);
                }
            });
            var jenkinsEndpointsTemplate = ich['ci_template']({"continuous_integration": jenkinsEndpoints, "ciType": "Jenkins", "icon": Common.icons.jenkins});
            var otherEndpointsTemplate = ich['ci_template']({"continuous_integration": otherEndpoints, "ciType": "Other", "icon": ""});
            $('#ci_page').html(jenkinsEndpointsTemplate);
            $('#ci_page').append(otherEndpointsTemplate);
            $('input').prop('disabled', true);
            $('button').button();
        },
        
        newCI: function(){
            new CIServerAddEditView();
        },

        editCI: function(event){
            var ciServerId = $(event.currentTarget).parent().find("input").data("id");
            var ciServer = this.ciServers.get(ciServerId);
            new CIServerAddEditView({ci_server: ciServer});
        },

        deleteCI: function(event) {
            var ciServerId = $(event.currentTarget).parent().find("input").data("id");
            var ciServer = this.ciServers.get(ciServerId);
            ciServer.destroy();
        },

        close: function(){
            this.$el.remove();
        }
        
    });

    return ContinuousIntegrationManagementView;
});
