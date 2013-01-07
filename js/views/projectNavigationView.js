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
        'views/projectNavigationSidebarView',
        'models/project',
        'collections/projects',
        'icanhaz',
        'common',
        'wijmo',
        'jquery-ui'
], function( $, _, Backbone, projectsTemplate, ProjectNavSidebarView, Project, projects, ich, Common ) {
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

		// Delegated events for creating new instances, etc.
		events: {
		    'click .projlink': 'selectOne',
			'click #new_project': 'createNew',
			'click #project_edit': 'editProject',
			'dblclick .projlink': 'editProject'
		},

		// At initialization we bind to the relevant events on the `Instances`
		// collection, when items are added or changed. Kick things off by
		// loading any preexisting instances.
		initialize: function() {
            _.bindAll(this, 'select');
			var compiledTemplate = _.template(projectsTemplate);
			this.$el.html(compiledTemplate);
			
			$('#new_project').button();
			$('#edit_project').button();
            //Set jQueryUI button style
            $('button').button();
            this.$detail = this.$('#detail');
            
            projects.fetch({update: true});
		},

		// Add project elements to the page
		render: function() {

		},

		createNew : function () {
			this.$detail.html(ich.new_project_dialog(
				new Project().attributes
			));
			$('.save_button').button();
		},
		
		
        selectOne : function (event, id) {
            var project, selectedModel;
            console.log("Id2:", id);
            console.log("event:", event);
            if (id && this.selectedId === id) {
                return;
            }
            
            projects.each(function(e) {
                if (e.get('id') === id) {
                    selectedModel = e;
                }
            });           

            this.selectedId = id;
            $("#projdetails").html(ich.project_details(selectedModel.attributes));
        },
        
        editProject: function() {
            console.log("Double-click captured");
            Common.router.navigate('projects/' + this.selectedId + '/edit', {trigger: true});
        }
	});
	
	var projView;
	
    Common.router.on('route:projects', function () {
        if ( !projView ) {
            projView = new ProjectsView();
        }
        console.log("Got project app route.");
    }, this);
    
    Common.router.on('route:projectDetail', function (id) {
        if ( !projView ) {
            projView = new ProjectsView();
        }
        console.log("Got project detail route.");
        projView.selectOne(event, id);
    }, this);

	console.log("Project Nav view defined");
	return ProjectsView;
});