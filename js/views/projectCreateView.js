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
        'collections/stacks',
        'collections/projects',
        'models/stack',
        'models/project',
        'views/projectNewTemplateView',
        'icanhaz',
        'common',
        'wijmo'
], function( $, _, Backbone, stacks, projects, Stack, Project, ProjectNewTemplateView, ich, Common ) {
    
    var ProjectCreateView = Backbone.View.extend({
        
        //OR use tagName, className, ...
        tagName: "div",
        
        id: "new_project",
                
        events: {
            'wijdialogclose' : 'close' 
        },
        
        initialize: function() {
           Common.vent.on('project:create', this.createProject, this);
           stacks.on( 'addOne', this.addOne, this );
           stacks.on( 'reset', this.addAll, this ); 
        },

        render: function() {
          
          this.$el.append( ich.new_project_window() );
          $("#main").append(this.$el);
          this.$el.wijdialog({
                autoOpen: true,
                captionButtons: {
                    refresh: {visible: false},
                    pin: {visible: false},
                    toggle: {visible: false},
                    minimize: {visible: false},
                    maximize: {visible: false}
                },
                minWidth: 400,
                modal: true,
                title: "New Project"
          });
          
          stacks.fetch({ success: this.handleAll, error: this.handleError, emulateJSON: true });
          
          return this;  
        },
        
        close: function() {
            this.remove();
            Common.gotoPreviousState();
            return false;
        },
        
        addOne: function(stack) {
            console.log('adding new stack');
            var stackTemplate = new ProjectNewTemplateView({ model: stack });
            this.$el.append(stackTemplate.render().el);
        },
        
        addAll: function( stacks ) {
            stacks.each(this.addOne, this);
        },
        
        handleAll: function(e) {
            console.log(e);
        },
        
        handleError: function(collection, xhr, options) {
            console.log(collection);
            console.log(xhr);
            console.log(options);
        },
        
        open: function() {
            this.render();
            Common.router.navigate('projects/new');   
        },
        
        createProject: function(stack) {
            this.$el.wijdialog("close");
            var newProject = new Project({
                name: stack.get('name'),
                template: stack.template()
            });
            
            projects.add( newProject );
        }
        
    });
    
    return ProjectCreateView;
});
