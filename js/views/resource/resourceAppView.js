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
        'text!templates/resources/actionBarTemplate.html',
        'jquery.dataTables',
        'jquery.dataTables.fnProcessingIndicator'
], function( $, _, Backbone, ich, Common , ResourceRowView, actionBarTemplate ) {
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

        createButton: true,

        createText: 'Create',

        loadTable : function ( options ) {
            options = options || {};
            options.bProcessing = options.bProcessing || true;
            var $el = options.$el || this.$el.find('#resource_table');

            this.$table = $el.dataTable({
                "bJQueryUI": options.bJQueryUI || true,
                "bProcessing": true,
                "bDestroy": options.bDestroy || true,
                "bSort" : options.bSort || false
            });

            this.$table.fnProcessingIndicator(!!options.bProcessing);

            this.collection.on( 'add', this.addOne, this );
            this.collection.on( 'reset', this.addAll, this );

            return this.$table;
        },

        loadActionMenu : function () {
            var actions = this.actions || [];
            var view = this;
            var $actionBar = $(actionBarTemplate);

            var $tableActions = $actionBar.find('#table_level_actions');
            var $rowActions = $actionBar.find('#action_menu');


            if(this.createButton) {
                var createAction = this.createAction(this.createText);
                $tableActions.append('<button class="create_button table-level-action">' + createAction.text + '</button>');
            }

            $.each(actions, function ( index, action ) {

                if(action.type === "table") {
                    $tableActions.append('<button id="' + action.id + '" class="table-level-action' + (action.cssClass || "") + '">' + action.text + '</button>');
                } else {
                    $rowActions.append('<li role="presentation"><a role="menuitem" tabindex="-1" href="#" id="' + action.id + '">' + action.text + '</a></li>');
                }
            });

            $actionBar.find("#action_menu li").addClass("ui-state-disabled");

            $actionBar.find('#row_level_actions a').click(function ( e ) {
                e.preventDefault();
            });

            if($tableActions.length === 0) {
                $tableActions = $actionBar.find('td:first');
                $tableActions.prop('id', "table_level_actions");
            }
            var $refreshButton = $tableActions.find('#refresh_resource_table');
            // if there isn't a refresh button, let's add it. Refreshing is good.
            if($refreshButton.length === 0) {
                $refreshButton = $('<button class="btn btn-primary" id="refresh_resource_table">Reload</button>');
                $tableActions.append($refreshButton);
            }

            $refreshButton.unbind('click');

            $refreshButton.on('click', function ( e ) {
                view.$table.fnProcessingIndicator(true);
                view.collection.fetch(this.collectionParams);
            });

            this.$el.find('.button_bar').html($actionBar);
        },

        loadData : function ( options ) {
            options = options || {};
            var data = options.data || {};

            if(this.region) { data.region = this.region; }
            if(this.credentialId) { data.cred_id = this.credentialId; }

            var parameters = {
                error : options.error || this.onLoadingError.bind(this),
                reset : options.reset || true,
                data : data
            };

            this.collectionParams = parameters;

            if(typeof(this.collection) === 'undefined') {
                var CollectionType = this.collectionType;
                this.collection = new CollectionType();
            }

            this.collection.fetch(parameters);

            if(options.render === true) {
                this.render();
                this.loadTable();
            }
        },

        render: function() {
            this.loadActionMenu();
            $('#resource_app').html(this.$el);

            this.delegateEvents(this.events);

            $('button').button();
            $('button').addClass("btn btn-primary");

            this.$el.find('#action_menu a').click(function ( e ) {
                e.preventDefault();
            });
        },

        onLoadingError : function ( err ) {
            this.$table.fnProcessingIndicator(false);
                var status,
                    message;
                if(err.statusText !== "")
                {
                    status = err.statusText;
                }else{
                    status = "Connection Error";
                }
                if(err.responseText !== "")
                {
                    message = err.responseText;
                }else{
                    message = "Unable to connect to server to fetch resources.";
                }
                Common.errorDialog(status, message);
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
            this.setResourceAppHeightify();
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
            var customId = $(event.currentTarget).data('id');
            if(customId) {
                id = customId;
            } else {
                id = rowData[this.idColumnNumber];
            }
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

                ich.refresh();
                if(!ich.templates.resource_detail) {
                    var $temp = $('<div>');
                    $temp.html(this.template());
                    var updatedTemplate = $temp.find('#resource_detail');
                    ich.addTemplate("resource_detail", updatedTemplate.html());
                }
                if (ich.templates.resource_detail) {
                    // Some templates use links to navigate to related resources, so merge the selected
                    // into the model attributes in order to use in template links
                    selectedModel.attributes['region'] = this.region;
                    $("#details").html(ich.resource_detail(selectedModel.attributes));
                    // Delete region attribute added above, as it was only needed for templating
                    delete selectedModel.attributes['region'];
                    var resourceApp = this;

                    if($('#detail_tabs .nav-tabs').length === 0) {
                        $("#detail_tabs").tabs({
                            select: function(event, ui) {
                                resourceApp.selectedTabIndex = ui.index;
                            }
                        });
                    }
                    $('.create_button').button();
                }
                this.toggleActions();
            }else {
                this.selectedId = undefined;
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
            if($("#subservice_menu_list").height()+56 > $("#resource_app").height()-30) {
                $(".resource_app_heightify").height($("#subservice_menu_list").height()+56);
            }else {
                if(this.selectedId) {
                    $(".resource_app_heightify").height($("#resource_app").height()-30);
                }else {
                    $(".resource_app_heightify").height($("#resource_app").height()-50);
                }
            }
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

        createAction : function ( text ) {
            return { text: text, cssClass: "create_button", type: "table"};
        },

        close: function(){
            //if(this.$table)
            //{
            //    this.$table.fnDestroy();
            //}
            this.undelegateEvents();
            this.$el.remove();
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

    return ResourceAppView;
});
