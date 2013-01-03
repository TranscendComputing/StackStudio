/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
define([
        'jquery',
        'underscore',
        'backbone',
        'text!templates/projects/projectsTemplate.html',
        'views/projectNavigationSidebarView',
        'models/project',
        'collections/projects',
        'icanhaz',
        'common'
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
			'dblclick .project_item' : 'open',
			'click .project_item' : 'select',
			'click #new_project' : 'createNew',
			'click #edit_project' : 'open'
		},

		// At initialization we bind to the relevant events on the `Instances`
		// collection, when items are added or changed. Kick things off by
		// loading any preexisting instances.
		initialize: function() {
            _.bindAll(this, 'select');
			$('#new_project').button();
			$('#edit_project').button();
            this.$detail = this.$('#detail');
			projects.on( 'add', this.addOne, this );
			projects.on( 'reset', this.addAll, this );
			projects.on( 'all', this.render, this );
			
			var compiledTemplate = _.template(projectsTemplate);
			this.$el.html(compiledTemplate);

			// Fetch will pull results from the server
			projects.fetch();
		},

		// Add project elements to the page
		render: function() {

		},

		// Add a single instance item to the list by creating a view for it.
		addOne: function( project ) {
			if (project.get('id') === "") {
				// Refuse to add projects until they're initialized.
				return;
			}
			//TODO
			//var view = new ProjectView({ model: project });
			//view.render();
		},

		// Add all items in the **Projects** collection at once.
		addAll: function() {
			projects.each(this.addOne, this);
		},

		createNew : function () {
			this.$detail.html(ich.new_project_dialog(
				new Project().attributes
			));
			$('.save_button').button();
		},
		
		open : function () {
		   //TODO  
		},

		select : function (event, id) {
			var p, project, selectedModel;
			console.log("Id2:", id);
			console.log("event:", event);
			if (id && this.selectedId === id) {
				return;
			}
			/*
			this.$table.$('tr').removeClass('row_selected');
			if (event.type === 'click') {
				$(event.target.parentNode).addClass('row_selected');
				// Find the second column of the clicked row; that's instance ID
				instance = $(event.target.parentNode).find(':nth-child(2)').html();
				Common.router.navigate("#/instance/"+instance, {trigger: false});
			} else {
				instance = id;
				console.log("Selecting ID:", id);
			}
			instances.each(function(e) {
				if (e.get('instanceId') === instance) {
					selectedModel = e;
				}
			});
			*/
			this.selectedId = project;
			this.$detail.html(ich.project_detail(selectedModel.attributes));
		}
	});
	
	var projectsView;
	
    Common.router.on('route:projects', function (id) {
        if ( !projectsView ) {
            projectsView = new ProjectsView();
        }
        console.log("Got project detail route.");
        //this.selectOne(event, id);
    }, this);
    
	/*
    Common.router.on('route:instanceDetail', function (id) {
        alert( "Get instance number " + id );
    });    

	var instancesView = new InstancesView();
	*/

	return ProjectsView;
});