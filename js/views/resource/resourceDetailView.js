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

            if (options.cred_id)
                this.credentialId = options.cred_id;
            if (options.region)
                this.region = options.region;
            if (options.$container)
                this.$container = options.$container;

            var parentViewOptions = [
                // Order is important: #resources/:cloud/:region/:type/:subtype
                options.parentView.cloudProvider, // 1st
                options.parentView.region,        // 2nd
                options.parentView.type,          // 3rd
                options.parentView.subtype        // 4th
            ].filter(Boolean);

            var route = ['#resources']
                        .concat(parentViewOptions)
                        .concat(this.model.id)
                        .join('/');

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


            $('#details').html(ich.resource_detail(this.model.attributes || this.model));

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
