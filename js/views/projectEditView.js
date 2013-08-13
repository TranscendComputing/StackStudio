/*!
 * (c) Copyright 2012-2013 Transcend Computing, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the License);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an AS IS BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
        'text!templates/projects/projectEditTemplate.html',
        'collections/projects',
        'models/project',
        'collections/template_resources',
        'views/autocompleteItemView',
        'ace',
        'icanhaz',
        'common',
        'JSV',
        'jquery-ui'
], function( $, _, Backbone, projectEditTemplate, projects, Project, templateResources, AutocompleteItemView, ace, ich, Common, JSV ) {

    'use strict';

    // The Project Edit View
    // ------------------------------

    /**
     * ProjectEditView is UI view for editing project resources.
     *
     * @name ProjectEditorView
     * @constructor
     * @category Projects
     * @param {Object} initialization object.
     * @returns {Object} Returns a ProjectEditor project.
     */
    var ProjectEditView = Backbone.View.extend({

        /** The ID of the selected project */
        selectedId: undefined,

        /** The editor object */
       editor: undefined,

        // Instead of generating a new element, bind to the existing skeleton of
        // the App already present in the HTML.
        el: '#main',

        template: _.template(projectEditTemplate),

        initialize: function() {
            console.log("Initializing routes.");
            Common.vent.on('project:addResource', this.addResource, this);
            Common.vent.on('project:selectResource', this.selectResource, this);
            Common.vent.on('project:renameResource', this.renameResource, this);
            Common.vent.on('project:loadTemplate', this.loadTemplate, this);
            Common.vent.on('route:loadTemplate', this.loadTemplate, this);
            this.$el.html(this.template);
        },

        // Add project elements to the page
        render: function() {
            $('button.info').button({
                icons: {
                    primary: 'ui-icon-info'
                }
            }).tooltip();
            $('#tabs').tabs();
            // Initialize editor
            ace.EditSession.prototype.$startWorker = function(){}; //This is a workaround for a worker bug
            this.editor = ace.edit("design_editor");
            this.editor.setTheme("ace/theme/twilight");
            this.editor.getSession().setMode("ace/mode/json");

            //Add custom autocomplete binding
            var newBinding = this.editor.keyBinding;
            var autocomplete = {
                bindKey: {
                    mac: "Ctrl-Space",
                    win: "Ctrl-Space"
                },
                name: "autocomplete",
                exec: function(editor) {Common.vent.trigger("onAutoComplete");}
            };
            var cm = newBinding.$handlers[0];
            cm.addCommand(autocomplete);
            this.editor.keyBinding = newBinding;
            Common.vent.on("onAutoComplete", this.renderAutoComplete, this);

            this.editor.resize();

            var p = new Project();
            this.editor.setValue(JSON.stringify(p.template(), null,'\t'));

            var selection = this.editor.getSelection();
            selection.moveCursorFileStart();

            var maxWidth = this.$el.width();

            $("#tabs").resizable({
                maxHeight: 1000,
                minHeight: 495,
                minWidth: maxWidth,
                maxWidth: maxWidth,
                resize: this.refresh
            });

            this.editor.on("change", this.handleChange);
        },

        handleChange: function(e) {
            var editor = ace.edit("design_editor");
            var content = editor.getValue();
            Common.vent.trigger('project:updateTemplate', content);
        },

        reformatTemplate: function(template, newData) {
            if (!newData) {
                newData = [];
            }

            $.each(template, function(property, value) {
                if ( _.isString(value) ) {
                    newData.push({"data": property, "children": value});
                }
            });
            return newData;
        },

        refresh: function(event, ui) {
            this.editor = ace.edit("design_editor");
            this.editor.resize();
        },

        renderAutoComplete: function() {
            var editor = ace.edit("design_editor");
            var content = editor.getValue();

            editor.session.setUseSoftTabs(false);

            var cursor = editor.getCursorPosition();

            // Create the suggest list
            var element = document.createElement('div');
            element.className = 'ace_autocomplete';
            //element.style.display = 'none';
            element.style.listStyleType = 'none';
            element.style.padding = '2px';
            element.style.position = 'fixed';
            element.style.zIndex = '1000';
            editor.container.appendChild(element);

            // Position the list
            var coords = editor.renderer.textToScreenCoordinates(cursor.row, cursor.column);
            element.style.top = coords.pageY + 15 + 'px';
            element.style.left = coords.pageX + -2 + 'px';
            element.style.display = 'block';

            var autocompleteView = new AutocompleteItemView();
            element.appendChild(autocompleteView.render().el);
            $("input").catcomplete("enable");
            $("input").focus();
        },

        addResource: function(resource) {
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

        selectResource: function(resourceName) {
            var range = this.editor.find(resourceName);
            this.editor.getSelection().setSelectionRange(range);
        },

        renameResource: function(newResourceName) {
            var currentName = this.editor.getCopyText();
            if (currentName === newResourceName) {
                return;
            }
            this.editor.replaceAll(newResourceName, {"needle": currentName});
        },

        loadTemplate: function(data) {
            console.log("loading template..." + data.length);
            this.editor.setValue(data.rawTemplate);
            this.editor.getSelection().moveCursorFileStart();
            /*
            var rawTemplate = data.rawTemplate,
                name = data.name,
                tabTemplate = "<li><a href='#{href}'>#{label}</a> <span class='ui-icon ui-icon-close'>Remove Tab</span></li>",
                tabs = $("#tabs").tabs();

            var label = name,
                id = "tabs-" + name.split(".")[0].toLowerCase(),
                li = $( tabTemplate.replace( /#\{href\}/g, "#" + id ).replace( /#\{label\}/g, label ) ),
                tabContentHtml = tabContent.val() || "Tab " + tabCounter + " content.";

            tabs.find( ".ui-tabs-nav" ).append( li );
            tabs.append( "<div id='" + id + "'><p>" + tabContentHtml + "</p></div>" );
            tabs.tabs( "refresh" );
            tabCounter++;
            */
        }
    });

    var projectEditor;

    Common.router.on('route:projectEdit', function () {
        console.log("Handling projectEdit, with CDN BB.");
        if ( !projectEditor ) {
            projectEditor = new ProjectEditView();
        }
        projectEditor.render();
    }, this);

    Common.router.on('route:projectUpdate', function (id, resource) {
        if ( !projectEditor ) {
            projectEditor = new ProjectEditView();
        }
    }, this);

    return ProjectEditView;
});
