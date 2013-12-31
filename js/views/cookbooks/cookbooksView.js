/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true requirejs:true require:true alert:true*/
define([
        'jquery',
        'underscore',
        'bootstrap',
        'backbone',
        'common',
        'text!templates/cookbooks/cookbooksTemplate.html',
        'collections/configManagers'
], function( $, _, bootstrap, Backbone, Common, cookbooksTemplate, ConfigManagers ) {

    var CookbooksView = Backbone.View.extend({

        tagName: 'div',
        id: 'cookbooks_view',

        template: _.template(cookbooksTemplate),

        events: {
            "click .configurationManager": "openConfigManager"
        },

        initialize: function() {
            $("#main").html(this.el);
            this.$el.html(this.template);
            this.configManagers = new ConfigManagers();
            this.configManagers.on( 'reset', this.addAllConfigManagers, this );
            this.render();
        },

        render: function(){
            this.configManagers.fetch({reset:true});
            if(this.currentConfigManager) {
                var configManagerName = this.currentConfigManager.attributes.name;
                $("#chef_select_button_label").html("Selected Chef: " + configManagerName);
                $("#default_landing_view").hide();
                if(this.currentConfigManager.attributes["continuous_integration_servers"].length > 0) {
                    $("#continuous_integration_setup_landing_view").hide();
                    $("#chef_continuous_integration_view").show();
                    this.renderContinuousIntegration();
                } else {
                    $("#chef_continuous_integration_view").hide();
                    $("#selected_cm_label").html(configManagerName);
                    $("#continuous_integration_setup_landing_view").show();
                }
            } else {
                $("#chef_continuous_integration_view").hide();
                $("#continuous_integration_setup_landing_view").hide();
                $("#default_landing_view").show();
                $("#chef_select_button_label").html("Select Chef");
            }
        },

        addAllConfigManagers: function() {
            $("#config_managers_list").empty();
            this.configManagers.each(function(configManager) {
                if(configManager.attributes.type === "chef") {
                    $("#config_managers_list").append("<li><a id='"+configManager.id+"' class='configurationManager selectable_item'>"+configManager.attributes.name+"</a></li>");
                }
            });
        },

        renderContinuousIntegration: function() {
            // Work for displaying the tests
        },

        openConfigManager: function(event) {
            this.currentConfigManager = this.configManagers.get(event.currentTarget.id);
            this.render();
        },

        close: function(){
            this.$el.remove();
        }

    });

    var cookbooksView;

    Common.router.on('route:cookbooks', function () {
        if(sessionStorage.account_id) {
            if (this.previousView !== cookbooksView) {
                this.unloadPreviousState();
                cookbooksView = new CookbooksView();
                this.setPreviousState(cookbooksView);
            }
            cookbooksView.render();
        }else {
            Common.router.navigate("", {trigger: true});
            Common.errorDialog("Login Error", "You must login.");
        }
    }, Common);

    return CookbooksView;
});
