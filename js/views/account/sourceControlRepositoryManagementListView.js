/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true requirejs:true require:true*/
define([
        'jquery',
        'underscore',
        'backbone',
        'common',
        'icanhaz',
        'text!templates/account/sourceControlRepositoryManagementListTemplate.html',
        'collections/sourceControlRepositories',
        'views/account/sourceControlRepositoryAddEditView',
        'jquery-plugins',
        'jquery-ui-plugins'
], function( $, _, Backbone, Common, ich, sourceControlManagementListTemplate, SCRepositories, SCRepositoriyAddEditView ) {

    var SourceControlRepositoryManagementView = Backbone.View.extend({
        tagName: 'div',
        template: undefined,
        rootView: undefined,
        ciServers: undefined,

        events: {
            "click #new_repository": "newRepository",
            "click button.repo_edit_button" : "editRepository",
            "click button.repo_delete_button": "deleteRepository"
        },

        /** Constructor method for current view */
        initialize: function(options) {
            this.template = _.template(sourceControlManagementListTemplate);
            this.$el.html(this.template);
            $("#submanagement_app").html(this.$el);
            this.rootView = options.rootView;
            this.repositories = new SCRepositories();
            this.rootView.repositories = this.repositories;
            
            var repoManagementView = this;
            Common.vent.off("SCRepoCreated");
            Common.vent.on("SCRepoCreated", function() {
                repoManagementView.render();
            });
            Common.vent.off("SCRepoUpdated");
            Common.vent.on("SCRepoUpdated", function() {
                repoManagementView.render();
            });
            Common.vent.off("SCRepoDeleted");
            Common.vent.on("SCRepoDeleted", function() {
                repoManagementView.render();
            });

            ich.refresh();
            this.render();
        },

        render: function () {
            var thisView = this;
            this.repositories.fetch({
                success:function(collection, response, data){
                    thisView.renderRepositories();
                },
                error:function(collection, response, data){
                    Common.errorDialog("Server Error", "Couldn't fetch source control repository data.");
                },
                reset: true
            });
        },

        renderRepositories: function() {
            if(typeof(ich['repo_template']) === 'undefined'){
                ich.grabTemplates();
            }
            var gitEndpoints = [];
            var otherEndpoints = [];
            this.repositories.each(function(repo) {
                repo = repo.attributes;
                if(repo["type"] === "git") {
                    gitEndpoints.push(repo);
                }else {
                    otherEndpoints.push(repo);
                }
            });
            var gitEndpointsTemplate = ich['repo_template']({"source_control": gitEndpoints, "repoType": "Git", "icon": Common.icons.git});
            var otherEndpointsTemplate = ich['repo_template']({"source_control": otherEndpoints, "repoType": "Other", "icon": ""});
            $('#repositories_page').html(gitEndpointsTemplate);
            $('#repositories_page').append(otherEndpointsTemplate);
            $('input').prop('disabled', true);
            $('button').button();
        },
        
        newRepository: function(){
            new SCRepositoriyAddEditView();
        },

        editRepository: function(event){
            var repoId = $(event.currentTarget).parent().find("input").data("id");
            var repo = this.repositories.get(repoId);
            new SCRepositoriyAddEditView({repository: repo});
        },

        deleteRepository: function(event) {
            var repoId = $(event.currentTarget).parent().find("input").data("id");
            var repo = this.repositories.get(repoId);
            repo.destroy();
        },

        close: function(){
            this.$el.remove();
        }
        
    });

    return SourceControlRepositoryManagementView;
});
