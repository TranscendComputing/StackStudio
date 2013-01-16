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
        'jquery-ui'
], function( $, _, Backbone, projectEditTemplate, projects, Project, templateResources, AutocompleteItemView, ace, ich, Common ) {
    
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
            Common.vent.on('project:addResource', this.addResource, this); 
            Common.vent.on('project:selectResource', this.selectResource, this);
            this.$el.html(this.template); 
        },

        // Add project elements to the page
        render: function() {
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
            Common.vent.on("onAutoComplete", this.renderAutoComplete);
            
            //this.editor.on('change', this.handleChange, this);
            //$("#design_editor").on('keyup', this.handleChange);
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
            
        },
        
        refresh: function(event, ui) {
            this.editor = ace.edit("design_editor");
            this.editor.resize();
        },
        
        renderAutoComplete: function() {
            var editor = ace.edit("design_editor");
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
            if (editor.isFocused) {
                console.log("editor has the focus");
            }
            
        },
        
        addResource: function(resource) {
            console.log("Adding new resource to project...");
            var content;
            console.log(this.editor);
            
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
        }
    });
    
    var projectEditor;

    Common.router.on('route:projectEdit', function () {
        console.log("Editor route");
        if ( !projectEditor ) {
            projectEditor = new ProjectEditView();
        }
        //projectEditor.selectedId = id;
        projectEditor.render();
        console.log("Got project edit route.");
        //projectEditor.open(event, id);
    }, this);

    Common.router.on('route:projectUdpate', function (id, resource) {
        console.log("Update route");
        if ( !projectEditor ) {
            projectEditor = new ProjectEditView();
        }
        console.log("Got project udpate route.");
    }, this);    

    return ProjectEditView;
});