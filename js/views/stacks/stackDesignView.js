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
        'text!templates/stacks/stackDesignTemplate.html',
        'collections/assemblies',
        '/js/aws/views/cloud_formation/awsCloudFormationStackCreateView.js',
        'ace',
        'mode-json',
        'jquery.jstree'
], function( $, _, Backbone, Common, stacksDesignTemplate, Assemblies, StackCreate, ace) {
    'use strict';

    var StackDesignView = Backbone.View.extend({

        template: _.template( stacksDesignTemplate ),

        editor: undefined,

        stack: undefined,

        newTemplateResources: undefined,

        newResourceTree: undefined,

        assemblies: undefined,

        events: {
            "click .jstree_custom_item": "treeFolderClick",
            "click .new_item_link": "addResource",
            "click #save_template_button": "saveTemplate",
            'click #run_template_button': "runTemplate"
        },

        initialize: function() {
            $("#design_time_content").html(this.el);
            this.$el.html(this.template);
            this.assemblies = new Assemblies();
            this.assemblies.on( 'reset', this.addAllAssemblies, this );
        },

        render: function() {
            this.editor = window.ace.edit("design_editor");
            this.editor.setTheme("ace/theme/monokai");
            this.editor.getSession().setUseWorker(false);
            this.editor.getSession().setMode("ace/mode/json");

            this.newResourceTree = $("#new_resources").jstree({
                // List of active plugins
                "plugins" : [
                    "json_data", "crrm", "themeroller"
                ],

                "core": {
                    "animation": 0
                 },

                "json_data" : {
                    "ajax": {
                        "url": "samples/cloud_resources.json",
                        "success": function(data) {
                            var services = {};
                            var itemId;
                            $.each(data, function(index, d) {
                                 if (services[d.service] === undefined) {
                                     services[d.service] = [];
                                 }
                                 //Add reference to parent tree
                                 d.parent_tree = "#new_resources";
                                 itemId = d.label.toLowerCase().replace(/\s/g, "_");
                                 services[d.service].push({
                                     "data": {
                                         "title": d.label,
                                         "attr": {
                                             "id": itemId,
                                             "class": "new_item_link"
                                         }
                                     },
                                     "attr": {"id": itemId + "_container"},
                                     "metadata": d
                                 });
                            });

                            var treeData = [];
                            $.each(services, function(s, v) {
                                treeData.push({
                                    data: s,
                                    children: v,
                                    "metadata": {"parent_tree": "#new_resources"}
                                });
                            });
                            return treeData;
                        }
                    },
                    "correct_state": false
                },

                "themeroller": {
                    "item": "jstree_custom_item"
                }
            });

            this.assemblies.fetch({reset:true});

            if(this.stack) {
                this.setStack(this.stack);
            }
        },

        addAllAssemblies: function() {
            $("#assemblies_list").empty();
            this.assemblies.each(function(assembly) {
                $("#assemblies_list").append("<li><a>"+assembly.attributes.name+"</a></li>");
            });
        },

        setStack: function(stack) {
            this.stack = stack;
            this.editor.getSession().setValue(stack.attributes.template);
            $("#stack_name").html(this.stack.attributes.name);
            $("#stack_description").html(this.stack.attributes.description);
            if(this.stack.attributes.compatible_clouds instanceof Array) {
                $("#stack_compatible_clouds").html(this.stack.attributes.compatible_clouds.join(", "));
            }else {
                $("#stack_compatible_clouds").html("");
            }
        },

        saveTemplate: function() {
            if(this.stack) {
                this.stack.attributes.template = this.editor.getValue();
                this.stack.update(this.stack.attributes);
            }
        },

        addResource: function(event) {
            var resource = $(event.currentTarget.parentNode).data();
            var groupSelector = "#current_" + resource.group.toLowerCase();
            var content;

            content = this.editor.getValue();
            if (content.replace(/\s/g,"") !== '') {
                content = jQuery.parseJSON(content);
            } else {
                content = {};
            }

            if (!content[resource.group]) {
                content[resource.group] = {};
            }

            $.extend(content[resource.group], resource.template);
            this.editor.setValue(JSON.stringify(content, null,'\t'));

            var range = this.editor.find(resource.name);
            this.editor.getSelection().setSelectionRange(range);
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
        },

        runTemplate: function() {
            var template = this.editor.getValue();
            this.newResourceDialog = new StackCreate({cred_id: this.credentialId, 
                mode: "run",
                stack: this.stack,
                content: template
            });
            this.newResourceDialog.render();
        }
    });

    return StackDesignView;
});