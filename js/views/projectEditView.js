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
        'models/project',
        'collections/template_resources',
        'views/autocompleteItemView',
        'ace',
        'icanhaz',
        'common',
        'jquery-ui'
], function( $, _, Backbone, projectEditTemplate, Project, templateResources, AutocompleteItemView, ace, ich, Common ) {
    
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
        el: '#project_main',
        
        template: _.template(projectEditTemplate),

        // At initialization we bind to the relevant events on the `Instances`
        // collection, when items are added or changed. Kick things off by
        // loading any preexisting instances.
        initialize: function() {
            Common.vent.on('project:addResource', this.addResource, this);
            this.render();
        },

        // Add project elements to the page
        render: function() {
            this.$el.html(this.template);
            
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
                    mac: "Command-Alt-Tab",
                    win: "Ctrl-Space"
                },
                name: "autocomplete",
                exec: function(editor) {Common.vent.trigger("onAutoComplete");}
            };
            var cm = newBinding.$handlers[0];
            cm.addCommand(autocomplete);
            this.editor.keyBinding = newBinding;
            Common.vent.on("onAutoComplete", this.handleChange);
            
            //this.editor.on('change', this.handleChange, this);
            //$("#design_editor").on('keyup', this.handleChange);
            this.editor.resize();
        },
        
        handleChange: function() {
            console.log("Changing doc.....");
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
            if (!content.Resources) {
                content.Resources = {};
            }
            
            $.extend(content.Resources, resource.get('template'));
            this.editor.setValue(JSON.stringify(content, null,'\t'));
        }
    });
    
    var projectEditor;

    Common.router.on('route:projectEdit', function (id) {
        console.log("Editor route");
        if ( !projectEditor ) {
            projectEditor = new ProjectEditView();
        }
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