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

    var InstanceRowView = Backbone.View.extend({

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
            //var selector_n = "#instance-table tr td:contains('";
            //var row = $(selector_n+this.model.get("instanceId")+"')").parent();
            //console.log("Old row:", row);
            // TODO: if there's an existing row, update it.
            // otherwise; create a new row.
            var added = $('#resource_table').dataTable().
                fnAddData( [
                            this.model.get("name"),
                            this.model.get("instanceId"),
                            this.model.get("keyName"),
                            this.model.get("running")
                            ]
            );
            this.setElement( $(selector_i+(added[0]+1)+')') );
            return this;
        }
    });

    return InstanceRowView;
});
