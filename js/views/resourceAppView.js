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
        'views/resourceRowView',
        'jquery.dataTables',
        'jquery.dataTables.fnProcessingIndicator',
        'wijmo'
], function( $, _, Backbone, ich, Common , ResourceRowView ) {
    'use strict';

    var ResourceAppView = Backbone.View.extend({
        selectedId: undefined,

        credentialId: undefined,

        region: undefined,

        modelStringIdentifier: undefined,

        collection: undefined,

        columns: [],

        idColumnNumber: 0,

        type: undefined,

        subtype: undefined,

        CreateView: undefined,

        selectedTabIndex: undefined,

        tagName: 'div',

        render: function() {
            this.$el.html(this.template);
            $("#resource_app").html(this.$el);
            this.delegateEvents(this.events);
            ich.refresh();
            $('button').button();
            $("#action_menu").menu();

            this.$table = $('#resource_table').dataTable({
                "bJQueryUI": true,
                "bProcessing": true,
                "bDestroy": true
            });
            this.$table.fnProcessingIndicator(true);

            var CollectionType = this.collectionType;
            this.collection = new CollectionType();
            this.collection.on( 'add', this.addOne, this );
            this.collection.on( 'reset', this.addAll, this );
            $("#action_menu li").addClass("ui-state-disabled");

            if(this.credentialId && this.region) {
                this.collection.fetch({ data: $.param({ cred_id: this.credentialId, region: this.region }) });
            }else if(this.credentialId) {
                this.collection.fetch({ data: $.param({ cred_id: this.credentialId }) });
            }else {
                this.collection.fetch();
            }
            this.setResourceAppHeightify();
        },

        addOne: function( model ) {
            if (model.get(this.modelStringIdentifier) === "") {
                return;
            }
            var view = new ResourceRowView({ tableId: "#resource_table", model: model });
            view.columns = this.columns;
            view.render();
        },

        addAll: function() {
            this.$table.fnClearTable();
            this.$table.fnProcessingIndicator(false);
            this.collection.each(this.addOne, this);

            if(this.selectedId) {
                this.selectOne(this.selectedId, $("tr:contains("+this.selectedId+")"));
            }
        },

        clickOne: function (event) {
            console.log($(event.currentTarget).data());
            var id, parentNode;
            var rowData = this.$table.fnGetData(event.currentTarget);
            console.log("ROW DATA", rowData, "COLUMN NUMBER", this.idColumnNumber);
            //TODO -- make more dynamic in order to allow user to define columns
            id = rowData[this.idColumnNumber];
            Common.router.navigate("#resources/" + this.cloudProvider + "/"+this.region+"/"+this.type+"/"+this.subtype+"/"+id, {trigger: false});
            this.selectOne(id, event.currentTarget);
        },

        selectOne : function (id, rowNode) {
            var selectedModel;
            var modelStringIdentifier = this.modelStringIdentifier;
            this.clearSelection();
            console.log("Selecting ID:", id);
            if(rowNode) {
                $(rowNode).addClass('row_selected');
            }

            selectedModel = this.collection.get(id);

            if(selectedModel) {

                this.selectedId = id;
                $("#action_menu li").removeClass("ui-state-disabled");
                var template = this.cloudProvider + "_resource_detail";
                if (ich.templates.resource_detail) {
                    $("#details").html(ich.resource_detail(selectedModel.attributes));
                    var resourceApp = this;
                    $("#detail_tabs").tabs({
                        select: function(event, ui) {
                            resourceApp.selectedTabIndex = ui.index
                        }
                    });
                    $('.create_button').button();
                }
                this.toggleActions();
            }
            this.setResourceAppHeightify();
        },

        clearSelection: function () {
            this.$table.$('tr').removeClass('row_selected');
            //$('#details').empty();
        },

        createNew : function () {
            var CreateView = this.CreateView;
            if(this.region) {
                this.newResourceDialog = new CreateView({cred_id: this.credentialId, region: this.region});
            }else {
                this.newResourceDialog = new CreateView({cred_id: this.credentialId});
            }
            this.newResourceDialog.render();
        },

        setResourceAppHeightify: function() {
            //set resource_app_heightify for other elements to reference
            $(".resource_app_heightify").height($("#resource_app").height());
        },

        /**
         *    This function is used to disable/enable any resource action menu items
         *    @author Curtis   Stewart
         *    @param  {jQuerySelector} menuItem [HTML node to be disabled/enabled]
         *    @param  {Boolean} condition [Condition to be met for enable/disable]
         */
        toggleActionItem: function(menuItem, condition) {
            if(condition)
            {
                menuItem.addClass("ui-state-disabled");
            }else{
                menuItem.removeClass("ui-state-disabled");
            }
        },

        close: function(){
            //if(this.$table)
            //{
            //    this.$table.fnDestroy();
            //}
            this.$el.empty();
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
            // handle other unbinding needs, here
            _.each(this.subViews, function(childView){
              if (childView.close){
                childView.close();
              }
            });
        }

    });

    console.log("resource app view defined");

    return ResourceAppView;
});
