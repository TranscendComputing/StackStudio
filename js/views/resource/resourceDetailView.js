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
        'icanhaz',
        'common',
        'views/resource/resourceRowView',
        'jquery.dataTables',
        'jquery.dataTables.fnProcessingIndicator'
], function( $, _, Backbone, ich, Common , ResourceRowView ) {
    'use strict';

    var ResourceDetailView = Backbone.View.extend({

        selectedTabIndex: undefined,

        tagName: 'div',

        initialize: function ( options ) {
            this.model = options.model;

            if(options.cred_id) {
                this.credentialId = options.cred_id;
            }
            if(options.region) {
                this.region = options.region;
            }
            if(options.$container) {
                this.$container = options.$container;
            }

            var route = '#resources/';
            if(options.parentView.cloudProvider) {
                route += options.parentView.cloudProvider + '/';
            }
            if(options.parentView.region) {
                route += options.parentView.region + '/';
            }
            if(options.parentView.type) {
                route += options.parentView.type + '/';
            }
            if(options.parentView.subtype) {
                route += options.parentView.subtype + '/';
            }
            route += this.model.id;

            Common.router.navigate(route, {trigger: false});
        },

        render: function () {
            var detailApp = this;
            this.$el.html(this.template);

            $('#tree_subview').html(this.$el);

            ich.refresh();
            
            if (!ich.templates.resource_detail) {
                ich.grabTemplates();
            }

            this.model.region = this.region;


            $('#details').html(ich.resource_detail(this.model.attributes));

            $("#detail_tabs").tabs({
                select: function(event, ui) {
                    detailApp.selectedTabIndex = ui.index;
                }
            });
        },

        close: function () {
            this.$el.empty();
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
        }

    });

    return ResourceDetailView;
});
