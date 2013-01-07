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
        'ace',
        'icanhaz',
        'common',
        'jquery-ui'
], function( $, _, Backbone, projectEditTemplate, Project, ace, ich, Common ) {
    
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
        el: '#projdetails',

        // Delegated events for creating new instances, etc.
        events: {
            //TODO
        },

        // At initialization we bind to the relevant events on the `Instances`
        // collection, when items are added or changed. Kick things off by
        // loading any preexisting instances.
        initialize: function() {
            _.bindAll(this, 'select');
            var compiledTemplate = _.template(projectEditTemplate);
            this.$el.html(compiledTemplate);
            
            $('#tabs').tabs();
            // Initialize editor
            this.editor = ace.edit("design_editor"); 
            this.editor.setTheme("ace/theme/twilight");
            this.editor.getSession().setMode("ace/mode/json"); 
            this.editor.resize();
        },

        // Add project elements to the page
        render: function() {

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

    return ProjectEditView;
});