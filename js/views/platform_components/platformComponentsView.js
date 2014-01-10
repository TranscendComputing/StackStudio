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
        components: [],
        template: _.template(platformComponentsTemplate),

        events: {
            "click .configuration-manager": "openConfigManager",
            "click #refresh_button": "fetchConfigManagers",
            "click #view_legend_toggle": "toggleLegend",
            "click .component-checkbox": "toggleCommunity"
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
                    $("#config_managers_list").append("<li><a id='"+configManager.id+"' class='configuration-manager selectable_item'>"+configManager.attributes.name+"</a></li>");
                }
                // If selected, refresh
                if(thisView.currentConfigManager && thisView.currentConfigManager.id === configManager.id) {
                    thisView.currentConfigManager = configManager;
                }
            });
            this.render();
        },

        renderContinuousIntegration: function() {
            if(this.currentConfigManager) {
                // Set default values
                var componentName = "Name";
                var ignoredComponentsLabel = "Community";
                switch(this.currentConfigManager.attributes.type) {
                    case "chef":
                        componentName = "Cookbook Name";
                        this.components = this.currentConfigManager.attributes.cookbooks;
                        ignoredComponentsLabel = "Ignored Cookbooks";
                        break;
                }

                if(this.components && this.components.length > 0) {
                    var thisView = this;
                    $("#continuous_integration_table_label").html("Continuous Integration Tests - " + this.currentConfigManager.attributes.name);
                    $("#continuous_integration_table").empty();
                    // Build Header of CI Table
                    var headerColumns = "<th style='width:100px;'>Community</th><th>"+componentName+"</th>";
                    $.each(this.components[0]["status"], function(key, value) {
                        var columnName = thisView.readify(key);
                        headerColumns += "<th width='150px;'>" + columnName + "</th>";
                    });
                    $("#continuous_integration_table").append("<thead><tr>"+headerColumns+"</tr></thead>");
                    // Build Body of CI Table
                    var ignored_components = [];
                    $.each(this.components, function(index, value) {
                        var rowContents = "<td>"+value["name"]+"</td>";
                        if(value["status"]) {
                            $.each(value["status"], function( key, statusValue) {
                                var icon = thisView.determineIcon(statusValue);
                                rowContents += "<td>"+icon+"</td>";
                            });
                        } else {
                            for(var i=0; i<Object.keys(thisView.components[0]["status"]).length; i++) {
                                rowContents += "<td><img src='/images/disrupted.gif'/></td>";
                            }
                        }
                        if(value["community"]) {
                            ignored_components.push(value);
                        } else {
                            $("#continuous_integration_table").append("<tr><td><input id='"+value["_id"]+"' type='checkbox' class='component-checkbox'/></td>"+rowContents+"</tr>");
                        }
                    });

                    $("#ignored_components_table").empty();
                    if(ignored_components.length > 0) {
                        // Setup Label for Ignored Components (Community)
                        $("#community_components_label").html(ignoredComponentsLabel);
                        $("#community_components_label").show();
                        // Build Header of Ignored Components (Community) Table
                        $("#ignored_components_table").append("<thead><tr><th style='width:100px;'>Community</th><th>"+componentName+"</th></tr></thead>");
                        // Build Body of Ignored Components (Community) Table
                        $.each(ignored_components, function(index, value) {
                            $("#ignored_components_table").append("<tr><td><input id='"+value["_id"]+"' type='checkbox' class='component-checkbox' checked/></td><td>"+value["name"]+"</td></tr>");
                        });
                    } else {
                        $("#community_components_label").hide();
                    }
                } else {
                    $("#continuous_integration_table_label").html("Continuous Integration Tests Not Available.");   
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
                    htmlString = "<img src='/images/disrupted.gif' width='20px'/>";
                    break;
                case "TBD":
                    // Yellow Light
                    htmlString = "<img src='/images/issues.gif' width='20px'/>";
                    break;
                case "PASSING":
                case "IN_SYNC":
                    // Green Light
                    htmlString = "<img src='/images/healthy.gif' width='20px'/>";
                    break;
                case "NONE":
                    // Grey Light
                    htmlString = "<img src='/images/grey.png' width='20px'/>";
                    break;
                default:
                    // Grey Light
                    htmlString = "<img src='/images/grey.png' width='20px'/>";
                    break;
            }
            return htmlString;
        },

        openConfigManager: function(event) {
            this.currentConfigManager = this.configManagers.get(event.currentTarget.id);
            this.render();
        },

        displayConfigurationManagerContent: function(value) {
            if(value) {
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

        toggleCommunity: function(event) {
            if(event.currentTarget) {
                // Find clicked component
                var selectedComponent;
                $.each(this.components, function(index, value) {
                    if(event.currentTarget.id === value["_id"]) {
                        selectedComponent = value;
                    }
                });
                if(selectedComponent) {
                    var thisView = this;
                    if($(event.currentTarget).is(":checked")) {
                        selectedComponent["community"] = true;
                    } else {
                        selectedComponent["community"] = false;
                    }
                    $.ajax({
                        url: Common.apiUrl + "/api/v1/orchestration/managers/"+thisView.currentConfigManager.id+"/components/"+selectedComponent["_id"]+"?_method=PUT",
                        type: "POST",
                        contentType: 'application/x-www-form-urlencoded',
                        dataType: 'json',
                        data: JSON.stringify(selectedComponent),
                        success: function(data) {
                            thisView.fetchConfigManagers();
                        },
                        error: function(jqXHR) {
                            Common.errorDialog(jqXHR.statusText, jqXHR.responseText);
                        }
                    });
                }
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
