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
        'backbone'
], function( $, _, Backbone ) {
    'use strict';

    var SpotInstanceRowView = Backbone.View.extend({

        events: {
        },

        initialize: function() {
            this.model.on( 'change', this.render, this );
            this.model.on( 'destroy', this.remove, this );
            this.model.on( 'visible', this.toggleVisible, this );
        },

        // Populate the column values in the table with the model.
        render: function() {
            var selector_i = "#resource_table tr:nth-child(";
            // TODO: if there's an existing row, update it.
            // otherwise; create a new row.
            var added = $('#resource_table').dataTable().
                fnAddData( [
                            this.model.get("spotInstanceRequestId"),
                            this.model.get("spotPrice"),
                            this.model.get("launchSpecification").imageId,
                            this.model.get("instanceId"),
                            this.model.get("launchSpecification").instanceType,
                            this.model.get("state")
                ]
            );
            this.setElement( $(selector_i+(added[0]+1)+')') );
            return this;
        }
    });

    return SpotInstanceRowView;
});
