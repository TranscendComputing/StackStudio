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
        'common',
        'text!templates/stacks/stackRunTemplate.html',
        'jquery.jstree'
], function( $, _, Backbone, Common, stacksRunTemplate ) {
    'use strict';

    var StackRunView = Backbone.View.extend({

        template: _.template( stacksRunTemplate ),

        stackResourceTree: undefined,

        stack: undefined,

        events: {
            "click .jstree_custom_item": "treeFolderClick"
        },

        initialize: function() {
            $("#run_time_content").html(this.el);
            this.$el.html(this.template);
        },

        render: function() {
            if(this.stack) {
                this.setStack(this.stack);
            }
        },

        setStack: function(stack) {
            this.stack = stack;
            $("#stack_run_name").html(this.stack.attributes.name);
            $("#stack_run_description").html(this.stack.attributes.description);
            $("#stack_run_compatible_clouds").html(this.stack.attributes.compatible_clouds.join(", "));
            var jsonTemplate = JSON.parse(this.stack.attributes.template);
            var treeData = [
                {
                    "data" : "Resources",
                    "attr":{"rel":"directory"},
                    "children" : []
                }
            ];
            var services = {};
            $.each(jsonTemplate.Resources, function(index, value) {
                var typeSplit = value.Type.split("::");
                var service = typeSplit[1];
                var subService = typeSplit[2];
                if(!services[service]) {
                    services[service] = {};
                }
                if(!services[service][subService]) {
                    services[service][subService] = [];
                }
                services[service][subService].push({
                    "data": {
                        "title": index,
                        "attr": {
                            "id": index,
                            "class": "new_item_link resource_not_running"
                        }
                    },
                    "attr": {"id": index + "_container"},
                    "metadata": value.Properties
                });
            });
            $.each(services, function(service, value) {
                var serviceChildren = [];
                $.each(value, function(subService, subServiceValue) {
                    var subServiceChildren = [];
                    $.each(subServiceValue, function(i, properties) {
                        subServiceChildren.push(properties);
                    })
                    serviceChildren.push({
                        data: subService,
                        attr: {"rel":"directory"},
                        children: subServiceChildren
                    });
                });
                treeData[0].children.push({
                    data: service,
                    attr: {"rel":"directory"},
                    children: serviceChildren
                });
            });

            this.stackResourceTree = $("#stack_run_resource_tree").jstree({
                // List of active plugins
                "plugins" : [
                    "json_data", "crrm", "themeroller"
                ],
                
                "core": {
                    "animation": 0
                 },

                "json_data" : {
                    "data": treeData
                },
                
                "themeroller": {
                    "item": "jstree_custom_item"
                }
            }).on('loaded.jstree', function() {
                $("#stack_run_resource_tree").jstree('open_all');
            });
        },

        treeFolderClick: function(event) {
            if($(event.target.parentElement).hasClass("jstree-closed")) {
                $(event.target.parentElement).removeClass("jstree-closed");
                $(event.target.parentElement).addClass("jstree-open");
            }else{
                $(event.target.parentElement).removeClass("jstree-open");
                $(event.target.parentElement).addClass("jstree-closed");
            }
            return false;
        }
    });

    return StackRunView;
});