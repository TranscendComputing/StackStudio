/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true requirejs:true require:true alert:true*/
define([
    'jquery',
    'underscore',
    'bootstrap',
    'backbone',
    'common',
    'text!templates/assemblies/assemblyDesignTemplate.html',
    'collections/chefEnvironments',
    'collections/cloudCredentials',
    'models/assembly',
    'collections/assemblies',
    'views/assemblies/configListView',
    'jquery-plugins',
    'jquery-ui-plugins',
    'jquery.dataTables',
    'jquery.dataTables.fnProcessingIndicator',
    'jquery.sortable'
], function($, _, bootstrap, Backbone, Common, assemblyDesignTemplate, ChefEnvironments, CloudCredentials, Assembly, Assemblies, ConfigListView) {

    var AssemblyDesignView = Backbone.View.extend({

        tagName: 'div',
        id: 'assembly_design_view',
        currentAssembly: undefined,

        template: _.template(assemblyDesignTemplate),
        events: {
            //"change #assemblyDesignCloudCreds" : "credentialChangeHandler",
            "change #chefEnvironmentSelect": "environmentSelectHandler",
            "click #save-assembly": "saveAssemblyHandler",
            "change input,textarea,select": "formChanged",
            "click .selectable_item": "clickImageHandler",
            "change #assemblyDesignTool" : "toolChangeHandler"
            //"shown" : "accordionShown"
        },

        environmentSelectHandler: function(evt) {
            this.listView.environmentSelectHandler(evt);
        },
        initialize: function(options) {
            console.log("Initialize assembly design view.");
            $("#assemblyDesign").html(this.el);
            this.$el.html(this.template);
            this.listView = options.listView;
            this.assemblies = options.assemblies;
            this.currentAssembly = new Assembly();

            this.listView.render();
            this.cloudCredentials = new CloudCredentials();
            this.cloudCredentials.on('reset', this.populateCredentials, this);

            //Cloud Credentials fetch is asyncronous due to custom fetch behavior.
            this.cloudCredentials.fetch();
            var $this = this;
            this.imageTable = $("#assemblyDesignImagesTable").dataTable({
                "bJQueryUI": true,
                "bProcessing": true,
                "bDestroy": true,
                bRetrieve: true,
                "fnCreatedRow": function(nRow, aData, iDataIndex) {
                    $(nRow).addClass("selectable_item");
                },
                "aoColumnDefs": [{
                    "bVisible": false,
                    aTargets: [0],
                    mData: "cid"
                }, {
                    "sTitle": "Name",
                    aTargets: [1],
                    mData: function(data){
                        return data.label || data.name;
                    }
                }, {
                    "sTitle": "Description",
                    aTargets: [2],
                    mData: function(data){
                        return data.description || "";
                    }
                }]
            });
        },

        close: function() {
            this.$el.empty();
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
        },

        populateCredentials: function() {
            var list = this.cloudCredentials;
            var select = $("#assemblyDesignCloudCreds")
                .empty()
                .on("change", $.proxy(this.credentialChangeHandler, this));
            list.forEach(function(element, index, list) {
                $('<option>')
                    .text(element.get("cloud_name") + ":" + element.get("name"))
                    .data("cloudCredentials", element)
                    .appendTo(select);
            });
            //select.trigger("change");
        },
        credentialChangeHandler: function(evt) {
            var $this = this;
            var optionSelected = $("option:selected", evt.target);
            var credential = this.credential = optionSelected.data("cloudCredentials");
            if (!credential) {
                this.flashError("We're sorry.  Cloud credentials could not be retrieved.");
                return;
            }

            this.listView.credential = credential;
            this.listView.fetchChefEnvironments().done(function(model) {
                $this.listView.populateChefEnvironments(new ChefEnvironments(model));
            });
            this.listView.populatePuppetClasses();
            this.populateImages(credential.get("cloud_provider").toLowerCase(), credential);
        },
        saveAssemblyHandler: function(e) {
            e.preventDefault();
            var configs = this.listView.getConfigs("#assemblyDesignTool");
            this.currentAssembly.set(configs);
            //If no id, then it's a new assembly.  Otherwise, update existing assembly.
            if(!this.currentAssembly.id){
                this.assemblies.createAssembly(this.currentAssembly, {});
            }
            else{
                this.currentAssembly.save({},{
                    success:function(){
                        Common.vent.trigger("assembliesViewRefresh");
                    },
                    error:function(){
                        Common.errorDialog("Server Error", "Could not save assembly.");
                    }
                });
            }
        },
        formChanged: function(evt) {
            var changed = evt.currentTarget;
            var value = $(evt.currentTarget).val();
            var obj = {};
            var attrs = _.clone(this.currentAssembly.attributes);
            if(changed.name === "image"){
                attrs[changed.name] = this.images.get(value).toJSON();
            }else{
                attrs[changed.name] = value;
            }
            this.currentAssembly.set(attrs);
        },
        populateImages: function(cloud, credential) {
            var $this = this;

            var imagesPath = "../" + cloud + "/collections/compute/" + cloud + "Images";
            this.imageTable.fnProcessingIndicator(true);
            require([imagesPath], function(Images) {
                var images = new Images();
                images.fetch({
                    data: $.param({ cred_id: credential.id, region: this.region }),
                    reset: true,
                    success: function(collection) {
                        $this.imageTable.fnClearTable();
                        $this.images = collection;
                        collection.each(function(model, index, stuff) {
                            var attrs = model.toJSON();
                            attrs["cid"] = model.cid;
                            $this.imageTable.fnAddData(attrs);
                        });
                        $this.imageTable.fnProcessingIndicator(false);
                        Common.vent.trigger("imagesLoaded");
                    }
                });
            });
        },
        clickImageHandler: function(evt) {
            $(".row_selected").removeClass("row_selected");
            $(evt.currentTarget).addClass("row_selected");
            var imageData = this.imageTable.fnGetData(evt.currentTarget);
            $("#assemblyDesignImage")
                .val(imageData.cid)
                .change();
        },
        toolChangeHandler: function(evt){
            $(".main-group").hide();
            $("#no_tool_selected").hide();
            $("#tool_selected").show();
            var currentTool = $(evt.currentTarget).val().toLowerCase();
            var accordion = $("#" + currentTool + "Accordion");
            accordion.show();
            //accordion.find("a").first().click();
        }
    });

    return AssemblyDesignView;
});