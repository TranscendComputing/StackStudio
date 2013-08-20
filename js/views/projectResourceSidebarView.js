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
        'icanhaz',
        'common'
], function( $, _, Backbone, sidebarTemplate, projects, resources, Account, ProjectNewResourcesListView, ProjectCurrentResourcesListView, TemplatesListView, ich, Common ) {
    
    var SidebarView = Backbone.View.extend({
        el: "#sidebar",
        
        newResourcesList: new ProjectNewResourcesListView(),
        
        currentResourcesList: new ProjectCurrentResourcesListView(),
        
        templatesList: new TemplatesListView(),

        events: {
            'click .tree_a': 'clickTemplate',
            'click .new_item_link': 'addResource',
            'dblclick .current_item_link': 'renameResource',
            'click .jstree_custom_item': 'handleClick' 
        },
        
        template: _.template(sidebarTemplate),
        
        handleClick: function(e) {
            var treeNode = $(e.currentTarget.parentNode);
            console.log(treeNode.data());
            $(treeNode.data().parent_tree).jstree("toggle_node", treeNode);
            return false;
        },
        
        initialize: function(){
            //TODO
        },
        
        render: function() {
            this.$el.html(this.template);
            //Set horizontal splitter
            this.$(".accordion").accordion({
                "heightStyle": "content",
                "collapsible": true
            });
            $("button.expand_button").button({
                "icons": {
                    "primary": "ui-icon-circle-plus"
                },
                "text": false
            });
            $("button.collapse_button").button({
                "icons": {
                    "primary": "ui-icon-circle-minus"
                },
                "text": false
            });
            
            this.newResourcesList.render();
            this.currentResourcesList.render();
            this.templatesList.render();
            
            return this;
        },
        
        loadTemplate: function(url, templateData) {
            var name;
            if (!templateData) {
                var rawUrl = url.replace("/blob", "").replace("github.com", "raw.github.com");
                $.ajax({
                    type: "GET",
                    url: "/getit?url=" + rawUrl,
                    success: function (txt) {
                      templateData = txt;
                      Common.vent.trigger("project:loadTemplate", {rawTemplate: templateData, name: name});
                    },
                   "error": function( err ) {
                       console.log("ERROR", err);
                   } 
                });                
            }
        },
        
        clickTemplate: function(e) {
            var treeItem = $(e.currentTarget.parentNode).data();
            var name = $(e.currentTarget).contents()[1];
            if (treeItem.type === "file") {
                var htmlUrl = treeItem.html_url;
                Common.router.navigate('open?url=' + htmlUrl); 
                this.loadTemplate(htmlUrl);
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
                function(){},
                true 
            );
            
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

    Common.router.on('route:projectEdit', function (url) {
        if ( !projectSidebar ) {
            projectSidebar = new SidebarView();
        }
        projectSidebar.render();
        if (url) {
            console.log(url);
            projectSidebar.loadTemplate(url);
        }
    }, this);
    
    return SidebarView;
});
