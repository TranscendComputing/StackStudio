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
        'text!templates/platform_components/platformComponentsTemplate.html',
        'collections/configManagers'
], function( $, _, bootstrap, Backbone, Common, platformComponentsTemplate, ConfigManagers ) {

    var PlatformComponentsView = Backbone.View.extend({

        tagName: 'div',
        id: 'platform_components_view',
        legendVisible: true,

        template: _.template(platformComponentsTemplate),

        events: {
            "click .configurationManager": "openConfigManager",
            "click #refresh_button": "fetchConfigManagers",
            "click #view_legend_toggle": "toggleLegend"
        },

        initialize: function() {
            $("#main").html(this.el);
            this.$el.html(this.template);
            this.configManagers = new ConfigManagers();
            this.configManagers.on( 'reset', this.addAllConfigManagers, this );
            this.fetchConfigManagers();
        },

        render: function(){
            if(this.currentConfigManager) {
                var configManagerName = this.currentConfigManager.attributes.name;
                $("#select_button_label").html("Selected Chef: " + configManagerName);
                $("#default_landing_view").hide();
                if(this.currentConfigManager.attributes["continuous_integration_servers"].length > 0) {
                    $("#continuous_integration_setup_landing_view").hide();
                    $("#continuous_integration_table_view").show();
                    this.displayConfigurationManagerContent(true);
                    this.renderContinuousIntegration();
                } else {
                    $("#continuous_integration_table_view").hide();
                    $("#selected_cm_label").html(configManagerName);
                    $("#continuous_integration_setup_landing_view").show();
                    this.displayConfigurationManagerContent(false);
                }
            } else {
                $("#continuous_integration_table_view").hide();
                $("#continuous_integration_setup_landing_view").hide();
                $("#default_landing_view").show();
                this.displayConfigurationManagerContent(false);
                $("#select_button_label").html("Select Chef");
            }
        },

        fetchConfigManagers: function() {
            this.configManagers.fetch({reset:true});
        },

        addAllConfigManagers: function() {
            var thisView = this;
            $("#config_managers_list").empty();
            this.configManagers.each(function(configManager) {
                // Only Chef is currently supported
                if(configManager.attributes.type === "chef") {
                    $("#config_managers_list").append("<li><a id='"+configManager.id+"' class='configurationManager selectable_item'>"+configManager.attributes.name+"</a></li>");
                }
                // If selected, refresh
                if(thisView.currentConfigManager && thisView.currentConfigManager.id == configManager.id) {
                    thisView.currentConfigManager = configManager;
                }
            });
            this.render();
        },

        renderContinuousIntegration: function() {
            if(this.currentConfigManager) {
                // Set default values
                var componentName = "Name";
                var components = [];
                switch(this.currentConfigManager.attributes.type) {
                    case "chef":
                        componentName = "Cookbook Name";
                        components = this.currentConfigManager.attributes.cookbooks;
                        break;
                }

                if(components && components.length > 0) {
                    var thisView = this;
                    $("#continuous_integration_table").empty();
                    // Build Header of Table
                    var headerColumns = "<th>"+componentName+"</th>";
                    $.each(components[0]["status"], function(key, value) {
                        var columnName = thisView.readify(key);
                        headerColumns += "<th>" + columnName + "</th>";
                    });
                    $("#continuous_integration_table").append("<thead><tr>"+headerColumns+"</tr></thead>");
                    // Build Body of Table
                    var ignored_components = [];
                    $.each(components, function(index, value) {
                        var rowContents = "<td>"+value["name"]+"</td>";
                        if(value["status"]) {
                            $.each(value["status"], function( key, statusValue) {
                                var icon = thisView.determineIcon(statusValue);
                                rowContents += "<td>"+icon+"</td>";
                            });
                        } else {
                            for(var i=0; i<Object.keys(components[0]["status"]).length; i++) {
                                rowContents += "<td><img src='/images/statusTerminated.gif'/></td>";
                            }
                        }
                        $("#continuous_integration_table").append("<tr>"+rowContents+"</tr>");
                    });
                }
            } 
        },

        readify: function(string) {
            var stringSplit = string.split("_");
            $.each(stringSplit, function(index, value) {
                stringSplit[index] = value.charAt(0).toUpperCase() + value.slice(1);
            });
            return stringSplit.join(" ");
        },

        determineIcon: function(statusString) {
            var htmlString;
            switch(statusString) {
                case "VERSION_NOT_FOUND_IN_REPO":
                case "NOT_FOUND_IN_REPO":
                case "OUT_OF_SYNC":
                case "FAILING":
                    // Red Light
                    htmlString = "<img src='/images/statusTerminated.gif'/>";
                    break;
                case "TBD":
                    // Yellow Light
                    htmlString = "<img src='/images/statusChanging.gif'/>";
                    break;
                case "PASSING":
                case "IN_SYNC":
                    // Green Light
                    htmlString = "<img src='/images/statusRunning.gif'/>";
                    break;
                case "NONE":
                    // Grey Light
                    htmlString = "<img src='/images/statusNone.png' width='16px'/>";
                    break;
                default:
                    // Grey Light
                    htmlString = "<img src='/images/statusNone.png' width='16px'/>";
                    break;
            }
            return htmlString;
        },

        openConfigManager: function(event) {
            this.currentConfigManager = this.configManagers.get(event.currentTarget.id);
            this.render();
        },

        displayConfigurationManagerContent: function(boolean) {
            if(boolean) {
                $("#refresh_button").show();
                $("#view_legend_toggle").show();
                this.renderLegend();
            } else {
                $("#refresh_button").hide();
                $("#view_legend_toggle").hide();
                $("#table_legend").hide();
            }
        },

        toggleLegend: function() {
            if(this.legendVisible) {
                this.legendVisible = false;
            } else {
                this.legendVisible = true;
            }
            this.renderLegend();
        },

        renderLegend: function() {
            if(this.legendVisible) {
                $("#table_legend").show();
                $("#view_legend_toggle").html("Hide Legend");
            } else {
                $("#table_legend").hide();
                $("#view_legend_toggle").html("Show Legend");
            }
        },

        close: function(){
            this.$el.remove();
        }

    });

    var platformComponentsView;

    Common.router.on('route:platformComponents', function () {
        if(sessionStorage.account_id) {
            if (this.previousView !== platformComponentsView) {
                this.unloadPreviousState();
                platformComponentsView = new PlatformComponentsView();
                this.setPreviousState(platformComponentsView);
            }
            platformComponentsView.render();
        }else {
            Common.router.navigate("", {trigger: true});
            Common.errorDialog("Login Error", "You must login.");
        }
    }, Common);

    return PlatformComponentsView;
});
