/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true requirejs:true require:true alert:true*/
define([
        'jquery',
        'underscore',
        'bootstrap',
        'backbone',
        'icanhaz',
        'common',
        'typeahead', // Not an AMD component!
        'text!templates/apps/appsListTemplate.html',
        'collections/apps',
        'models/app',
        'views/apps/appListItemView',
        'jquery-plugins',
        'jquery-ui-plugins'
], function( $, _, bootstrap, Backbone, ich, Common, typeahead, appsListTemplate, Apps, App, AppListItemView ) {
        var AppsListView = Backbone.View.extend({
            collection: new Apps(),

            template: _.template(appsListTemplate, null),

            initialize: function() {
                    this.collection.on('add', this.render, this);
                    this.collection.on('remove', this.render, this);
            },

            addApp: function(app){
                var addedApp = new App(app);
                this.collection.add(addedApp);
            },

            removeApp: function(app){
                this.collection.remove(app);
                if (this.collection.length === 0){
                    this.trigger("lastAppRemoved", this.collection);
                }
            },

            render: function(){
                var $this = this;
                this.$el.html(this.template({model:this.collection}));
                _.each(this.collection.models, function(elem,idx,list){
                        var itemView = new AppListItemView({model: elem});
                        itemView.render();
                        $("#selected-apps").append(itemView.$el);
                        itemView.on("appRemoved", $this.removeApp, $this);

                });
            }
        });
        return AppsListView;
});