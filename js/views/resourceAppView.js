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
        'jquery.dataTables'
], function( $, _, Backbone, ich, Common ) {
    'use strict';

    // Instances Application View
    // ------------------------------

    /**
     * InstancesAppView is UI view list of cloud instances.
     *
     * @name InstancesAppView
     * @constructor
     * @category Resources
     * @param {Object} initialization object.
     * @returns {Object} Returns a ComputeAppView instance.
     */
    var ResourceAppView = Backbone.View.extend({
        selectedId: undefined,
        modelStringIdentifier: undefined,
        idRowNumber: 0,
        model: undefined,
        collection: undefined,
        type: undefined,
        subtype: undefined,
        createView: undefined,
        rowView: undefined,
        el: '#resource_app',

        render: function() {
            if(this.selectedId) {
                this.selectOne(this.selectedId, $("tr:contains("+this.selectedId+")"));
            }
        },
        
        addOne: function( model ) {
            if (model.get(this.modelStringIdentifier) === "") {
                return;
            }
            var rowView = this.rowView;
            var view = new rowView({ model: model });
            view.render();
        },

        addAll: function() {
            this.collection.each(this.addOne, this);
        },
        
        clickOne: function (event) {
            var id, parentNode;
            console.log("event:", event);
            parentNode = event.target.parentNode;
            id = $(parentNode).find(':nth-child('+this.idRowNumber+')').html();
            Common.router.navigate("#resources/aws/"+this.type+"/"+this.subtype+"/"+id, {trigger: false});
            this.selectOne(id, parentNode);
        },

        selectOne : function (id, parentNode) {
            var selectedModel;
            var modelStringIdentifier = this.modelStringIdentifier;
            this.clearSelection();
            console.log("Selecting ID:", id);
            if(parentNode) {
                $(parentNode).addClass('row_selected');
            }
            
            this.collection.each(function(e) {
                if (e.get(modelStringIdentifier) === id) {
                    selectedModel = e;
                }
            });
            
            if(selectedModel) {
                this.selectedId = id;
                $("#details").html(ich.resource_detail(selectedModel.attributes));
                $("#detail_tabs").tabs();
            }else {
                
            }
        },
        
        clearSelection: function () {
            this.$table.$('tr').removeClass('row_selected');
            $('#details').html("");
        },
        
        createNew : function () {
            var createView = this.createView;
            var createNew = new createView();
            createNew.render();
        }
    });

    console.log("resource app view defined");
    
    return ResourceAppView;
});
