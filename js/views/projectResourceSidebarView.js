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
        'text!templates/projects/projectResourceSidebarTemplate.html',
        'collections/projects',
        'collections/template_resources',
        'models/account',
        'views/projectNewResourcesListView',
        'views/projectCurrentResourcesListView',
        'views/templatesListView',
        'views/accountLoginView',
        'icanhaz',
        'common',
        'wijmo'
], function( $, _, Backbone, sidebarTemplate, projects, resources, Account, ProjectNewResourcesListView, ProjectCurrentResourcesListView, TemplatesListView, AccountLoginView, ich, Common ) {
    
    var SidebarView = Backbone.View.extend({
        el: "#sidebar",
        
        newResourcesList: new ProjectNewResourcesListView(),
        
        currentResourcesList: new ProjectCurrentResourcesListView(),
        
        templatesList: new TemplatesListView(),

        events: {
            'click .tree_a': 'loadTemplate',
            'click .new_item_link': 'addResource',
            'click .current_item_link': 'selectResource',
            'dblclick .current_item_link': 'renameResource'
        },
        
        template: _.template(sidebarTemplate),
        
        initialize: function(){
            //TODO
        },
        
        render: function() {
            this.$el.html(this.template);
            this.$el.addClass("fourcol");
            //Set horizontal splitter
            this.$(".accordion").accordion({
                "heightStyle": "content"
            });
            this.newResourcesList.render();
            this.currentResourcesList.render();
            this.templatesList.render();
            return this;
        },
        
        loadTemplate: function(e) {
            var treeItem = $(e.currentTarget.parentNode).data();
            var name = $(e.currentTarget).contents()[1];
            console.log("Tree item selected...", treeItem);
            if (treeItem.type === "file") {
                var htmlUrl = treeItem.html_url;
                var rawUrl = htmlUrl.replace("/blob", "").replace("github.com", "raw.github.com");
                console.log("RAW URL.....", rawUrl);
                $.ajax({
                   "url": rawUrl,
                   "type": "get",
                   "dataType": "json",
                   "success": function (data) {
                       var template = jQuery.parseJSON(data);
                       console.log(template);
                   },
                   "error": function( err ) {
                       var accountLoginView = new AccountLoginView({model: new Account(), message: "Please login with Github credentials to view templates."});
                       accountLoginView.render();
                   } 
                });
            } else if (treeItem.type === "blob") {
                var templatesRepo = Common.github.getRepo("TranscendComputing", "CloudFormationTemplates");
                templatesRepo.read("master", treeItem.path, function(err, data) {
                    Common.vent.trigger("project:loadTemplate", {rawTemplate: data, name: name});
                });
            }
            
            return false;
        },
        
        addResource: function(e) {
            var resource = $(e.currentTarget.parentNode).data();
            var groupSelector = "#current_" + resource.group.toLowerCase();
            this.currentResourcesList.tree.jstree(
                "create", 
                $(groupSelector), 
                "inside", 
                { 
                    "data": {
                         "title": resource.name, 
                         "attr": {
                             "id": resource.name, 
                             "class": "current_item_link"
                         } 
                    }, 
                    "attr": {"id": resource.name + "_container"},
                    "metadata": {"name": resource.name} 
                },
                function(){console.log("Added ", resource.name);},
                true 
            );
            
            console.log(resource);
            Common.vent.trigger("project:addResource", resource);
            return false;
        },
        
        selectResource: function(e) {
            Common.vent.trigger("project:selectResource", e.currentTarget.id);
            return false;
        },
        
        renameResource: function(e) {
            this.selectResource(e);
            var selector = "#" + e.currentTarget.parentNode.id;
            this.tree.jstree("rename", selector);
            return false;
        }    
    });
    
    var projectSidebar;

    Common.router.on('route:projectEdit', function (id) {
        console.log("Editor route");
        if ( !projectSidebar ) {
            projectSidebar = new SidebarView();
        }
        projectSidebar.render();
        console.log("Got project resource sidebar route.");
    }, this);
    
    return SidebarView;
});
