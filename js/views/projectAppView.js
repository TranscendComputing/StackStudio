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
        'text!templates/projects/projectsTemplate.html',
        'models/project',
        'collections/projects',
        'views/projectDetailsView',
        'views/projectEditView',
        'views/projectCreateView',
        'icanhaz',
        'common',
        'jquery-ui'
], function( $, _, Backbone, projectsTemplate, Project, projects, ProjectDetailsView, ProjectEditView, ProjectCreateView, ich, Common ) {
    'use strict';

    // The Projects Navigation View
    // ------------------------------

    /**
     * ProjectsView is UI view list of projects and brief descriptions.
     *
     * @name ProjectsView
     * @constructor
     * @category Projects
     * @param {Object} initialization object.
     * @returns {Object} Returns a ProjectsView project.
     */
    var ProjectsView = Backbone.View.extend({

        /** The ID of the selected project */
        selectedId: undefined,
                
        // Instead of generating a new element, bind to the existing skeleton of
        // the App already present in the HTML.
        el: '#main',

        template: _.template( projectsTemplate ),
        
        // Delegated events for creating new instances, etc.
        events: {
            'click #project_edit': 'editProject',
            'click #project_back': 'saveProject',
            'click .resource_link': 'addResource'
        },

        // At initialization we bind to the relevant events on the `Instances`
        // collection, when items are added or changed. Kick things off by
        // loading any preexisting instances.
        initialize: function() {
            Common.vent.on('project:show', this.selectOne, this);
            Common.vent.on('project:createNew', this.createNew, this);
            this.render();
        },

        // Add project elements to the page
        render: function() {
            this.$el.html(this.template);
            
            //Set jQueryUI button style
            $('button').button();
            
            //Top-level app templates have app specific templates,
            // so refresh ich in order to use new templates
            ich.grabTemplates();
            
            return this;
        },

        createNew: function () {
            Common.setPreviousState( this );
            var newProjectWindow = new ProjectCreateView();
            newProjectWindow.open();
            return false;
        },
        
        
        selectOne : function (project) {
            var id = project.get('id');
            if (id && this.selectedId === id) {
                return;
            }

            this.selectedId = id;
            this.selectedProject = project;
            this.render();
            
            var projectDetails = new ProjectDetailsView({ model: project });
            projectDetails.render();
        },
        
        updateDetails: function(id) {
            projects.each( function (project) {
                if (project.get('id') === id) {
                    this.selectOne(project);
                }
            }, this);
        },
        
        editProject: function() {
            if (!this.selectedId) {
                return;
            }
            
            Common.router.navigate('projects/' + this.selectedId + '/edit', {trigger: true});
        },
        
        saveProject: function() {
            Common.gotoPreviousState();
        },
        
        addResource: function() {
            return false;
        }
    });
    
    var projView;
    
    Common.router.on('route:projects', function () {
        if ( !projView || projView.el.innerHTML === '') {
            projView = new ProjectsView();
        }
    }, this);
    
    Common.router.on('route:projectDetail', function (id) {
        if ( !projView ) {
            projView = new ProjectsView();
        }
        if (projView.selectedId !== id) {
            projView.updateDetails(id);
        }
    }, this);

    Common.router.on('route:projectCreate', function () {
        if ( !projView ) {
            projView = new ProjectsView();
        }
        projView.createNew();
    }, this);
    
    return ProjectsView;
});
