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
        
        type: undefined,
        
        subtype: undefined,
        
        CreateView: undefined,
        
        RowView: undefined,
        
        el: '#resource_app',

        render: function() {
            this.$el.html(this.template);
            ich.refresh();
            $('#create_button').button();
            this.$table = $('#resource_table').dataTable({"bJQueryUI": true});
            this.collection.on( 'add', this.addOne, this );
            this.collection.on( 'reset', this.addAll, this );

            // Fetch will pull results from the server
            this.collection.fetch();
        },
        
        addOne: function( model ) {
            if (model.get(this.modelStringIdentifier) === "") {
                return;
            }
            var RowView = this.RowView;
            var view = new RowView({ model: model });
            view.render();
        },

        addAll: function() {
            this.collection.each(this.addOne, this);
            
            if(this.selectedId) {
                this.selectOne(this.selectedId, $("tr:contains("+this.selectedId+")"));
            }
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
            var CreateView = this.CreateView;
            var createNew = new CreateView();
            createNew.render();
        }
    });

    console.log("resource app view defined");
    
    return ResourceAppView;
});
