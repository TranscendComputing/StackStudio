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
        'aws/views/cloud_formation/awsCloudFormationStackCreateView',
        'ace',
        'collections/configManagers',
        'jquery.jstree'
], function( $, _, Backbone, Common,  stackDesignTemplate, Assemblies, StackCreate, ace, ConfigManagers) {
    'use strict';

    var StackDesignView = Backbone.View.extend({
        template: _.template(stackDesignTemplate),
        editor: undefined,
        stack: undefined,
        newTemplateResources: undefined,
        newResourceTree: undefined,
        assemblies: undefined,
        configManagers: undefined,
        instances: [],

        events: {
            "click .jstree_custom_item": "treeFolderClick",
            "click #save_template_button": "saveTemplate",
            'click #run_template_button': "runTemplate",
            "click .toggle_resource": "toggleResourceHandler",
            'click .toggle_assembly' : 'toggleAssemblyHandler'
        },

        initialize: function() {
            $("#design_time_content").html(this.el);
            this.$el.html(this.template);
            this.configManagers = new ConfigManagers();
            this.configManagers.fetch({
              data: $.param({org_id: Common.account.org_id})
            });
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
                                             "class": "toggle_resource"
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
                var assemblyEl = $("<li><a>"+assembly.attributes.name+"</a></li>")
                  .data('configuration', assembly.attributes)
                  .addClass('toggle_assembly');
                $("#assemblies_list").append(assemblyEl);
            });
        },

        removeAssemblyResources: function(){
        },

        addAssemblyResources: function(){
        },


        // [TODO] Use an add/removeAssemblyHandler instead
        toggleAssemblyHandler: function(e) {
          var conf  = $(e.currentTarget).data()['configuration'];
          var content = this.getContent();
          var resourceNode = $('#instance_container');
          var resource = resourceNode.data();
          var disable = resourceNode.hasClass('ui-state-active');
          var t = $.extend({}, resource.template);
          // Common for all AWS assemblies
          var newInstance =  t.NewInstance;
          newInstance.Properties['AvailabilityZone'] = 'us-east-1a'; // defaults for now
          newInstance.Properties['Tenancy'] = 'default'; // defaults for now
          newInstance.Properties['ImageId'] = conf.image.region['us-east-1'];
          switch(conf.tool){
            case 'Ansible':
              var jobs =[];
              var config;
              $.each(conf.configurations.ansible.host_config, function(i,job){
                jobs.push(job.id);
              });
              $.each(this.configManagers.toJSON()['ansible'], function(index, ansible){
                if (ansible.enabled){
                  config = ansible;
                }
              });
              this.instances.push({'NewInstance':jobs});
              newInstance.Properties['KeyName'] = config.auth_properties.ansible_aws_keypair;
              break;
          }
          if (disable) {
            this.removeResource(resource, content);
            $(resourceNode).removeClass('ui-state-active');
          } else {
            this.addResource(resource, content,t);
            $(resourceNode).addClass('ui-state-active');
          }
        },

        getContent: function(){
          var content = this.editor.getValue();
          if (content.replace(/\s/g,"") !== '') {
              content = jQuery.parseJSON(content);
          } else {
              content = {};
          }
          return content;
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

        setContent: function(resource, content){
          this.editor.setValue(JSON.stringify(content, null,'\t'));
        },

        removeResource:  function (resource, content) {
          if (content[resource.group]) {
              delete content[resource.group][resource.name];
          }
          this.setContent(resource, content);
        },

        addResource: function(resource, content, conf) {
            var groupSelector = "#current_" + resource.group.toLowerCase();
            if (!content[resource.group]) {
                content[resource.group] = {};
            }
            if (!conf){
              conf = resource.template;
            }
            $.extend(content[resource.group], conf);
            this.setContent(resource, content);
            var range = this.editor.find(resource.name);
            this.editor.getSelection().setSelectionRange(range);
        },

        toggleResourceHandler: function(event) {
            var resourceNode = event.currentTarget.parentNode;
            var resource = $(resourceNode).data();
            var content = this.getContent();
            var disable = $(resourceNode).hasClass('ui-state-active');
            if (disable) {
              this.removeResource(resource, content);
              $(resourceNode).removeClass('ui-state-active');
            } else {
              this.addResource(resource, content);
              $(resourceNode).addClass('ui-state-active');
            }
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
            var t_data = $.parseJSON(template);
            $.each (t_data.Resources, function(r_key, resource){
              $.each(resource.Properties, function(p_key, prop){
                if (prop.length === 0 ) {
                  delete (t_data.Resources[r_key].Properties[p_key]);
                }
              });
            });
            template = $.json_stringify(t_data);
            this.newResourceDialog = new StackCreate({cred_id: this.credentialId,
                mode: "run",
                stack: this.stack,
                content: template,
                instances: this.instances
            });
            this.newResourceDialog.render();
        }
    });

    return StackDesignView;
});
