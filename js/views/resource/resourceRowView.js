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
        
        tableId: undefined,

        initialize: function(options) {
            this.tableId = options.tableId;
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
                var dataValue;
                //split in case value is embedded in an object
                var valuePathArray = value.split(".");
                if(valuePathArray.length === 1) {
                    dataValue = model.get(value); 
                }else if(valuePathArray.length === 2){
                    var valObject = model.get(valuePathArray[0]);
                    dataValue = valObject[valuePathArray[1]];
                }
                
                // if value is undefined send as empty string
                if(dataValue) {
                    rowData.push(dataValue);
                } else {
                    if(dataValue === 0) {
                        rowData.push("0");
                    }else {
                        rowData.push("");
                    }
                }
            });
            var added = $(this.tableId).dataTable().fnAddData(rowData);
            this.setElement( $(selector_i+(added[0]+1)+')') );
            this.$el.data( model.attributes );
            this.$el.addClass("selectable_item");
            return this;
        }
    });

    return ResourceRowView;
});
