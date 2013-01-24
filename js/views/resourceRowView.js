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

    var ResourceRowView = Backbone.View.extend({
        columns: [],

        initialize: function() {
            this.model.on( 'change', this.render, this );
            this.model.on( 'destroy', this.remove, this );
            this.model.on( 'visible', this.toggleVisible, this );
        },

        // Populate the column values in the table with the model.
        render: function() {
            var model = this.model;
            var selector_i = "#resource_table tr:nth-child(";
            // TODO: if there's an existing row, update it.
            // otherwise; create a new row.
            var rowData = [];
            $.each(this.columns, function (index, value) {
                //split in case value is embedded in an object
                var splitArray = value.split(".");
                if(splitArray.length === 1) {
                    rowData.push(model.get(value));
                }else if(splitArray.length === 2){
                    var valObject = model.get(splitArray[0]);
                    rowData.push(valObject[splitArray[1]]);
                }
            });
            var added = $('#resource_table').dataTable().fnAddData(rowData);
            this.setElement( $(selector_i+(added[0]+1)+')') );
            this.$el.data(model.attributes);
            return this;
        }
    });

    return ResourceRowView;
});
