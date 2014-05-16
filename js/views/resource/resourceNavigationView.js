/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true, laxcomma:true*/
/*global define:true console:true requirejs:true require:true alert:true*/
define([
        'jquery',
        'underscore',
        'backbone',
        'icanhaz',
        'common',
        'text!templates/resources/resourcesTemplate.html',
        'text!templates/resources/breadcrumb.html',
        'models/cloudCredential',
        'collections/cloudCredentials',
        'views/resource/subServiceMenuView',
        '/js/vcloud/collections/compute/vcloudDataCenters.js',
        'jquery-plugins',
        'jquery-ui-plugins'
], function( $, _, Backbone, ich, Common, resourcesTemplate, breadcrumbTemplate,
        cloudCredential, CloudCredentials, SubServiceMenuView, DataCenters ) {
    // The Resources Navigation View
    // ------------------------------

    /**
     * ResourcesView is UI view of resource services.
     *
     * @name ResourcesView
     * @constructor
     * @category Resources
     * @param {Object} initialization object.
     * @returns {Object} Returns a ResourcesView project.
     */
    var ResourcesView = Backbone.View.extend({

        id: 'resource_navigation_view',

        className: ['twelvecol', 'last'],

        template: _.template(resourcesTemplate),

        crumbTemplate: _.template(breadcrumbTemplate),

        cloudProvider: undefined,

        type: undefined,

        subtype:undefined,

        resourceId: undefined,

        cloudDefinitions: undefined,

        cloudCredentials: undefined,

        selectedCredential: undefined,

        selectedRegion: undefined,

        selectedDataCenter: undefined,

        DataCenters: DataCenters,

        subServiceMenu: undefined,

        resourceApp: undefined,

        events: {
            "click .resource_link" : "resourceClick",
            "click #cloud_coverflow img" : "cloudChange",
            "change #credential_select": "credentialChange"
        },

        initialize: function() {
            this.subViews = [];
            $("#main").html(this.el);
            this.$el.html(this.template);

            var response = $.ajax({
                url: "samples/cloudDefinitions.json",
                async: false
            }).responseText;



            this.subServiceMenu = new SubServiceMenuView();

            this.cloudDefinitions = $.parseJSON(response);

            this.cloudCredentials = new CloudCredentials();
            this.cloudCredentials.on('reset', this.addAllClouds, this );
            

            //load user's cloud selections
            this.cloudCredentials.fetch({reset: true});
        },

        render: function () {
            if($("#cloud_coverflow").children().length > 0){
                //debugger

                if(this.resourceApp) {
                    this.resourceApp.remove();
                } else {
                    var policy;
                    var firstCloudProvider;
                    policy = JSON.parse(sessionStorage.group_policies);
                    if (policy.length > 0){
                        firstCloudProvider = policy[0].group_policy.org_governance.default_cloud.toLowerCase();
                    }else{
                        firstCloudProvider = $("#cloud_coverflow").children()[0].id;
                    }
                    //Google Cloud Hack until we get governance setup. Remove when we get governance.
                    if($("#cloud_coverflow").children().first().attr('id') === "google" && $("#cloud_coverflow").children().length === 1 ){
                        firstCloudProvider = $("#cloud_coverflow").children()[0].id;
                    }
                    if(this.cloudProvider) {
                        if($("#"+this.cloudProvider).length) {
                            this.cloudSelection(this.cloudProvider);
                            Common.router.navigate("#resources/"+this.cloudProvider, {trigger: false});
                        }else {
                            Common.router.navigate("#resources/"+firstCloudProvider, {trigger: false});
                            this.cloudSelection(firstCloudProvider);
                        }
                    }else if(sessionStorage['selected_cloud'] !== undefined){
                        Common.router.navigate("#resources/"+sessionStorage['selected_cloud'], {trigger: false});
                        this.cloudSelection(sessionStorage['selected_cloud']);
                    }else{
                        Common.router.navigate("#resources/"+firstCloudProvider, {trigger: false});
                        this.cloudSelection(firstCloudProvider);
                    }
                }
                if(this.cloudProvider === 'vcloud' && !this.dataCenters) {
                    this.loadDataCenters(this.loadResourceApp.bind(this));
                } else {
                    this.loadResourceApp();
                }
            }else{
                this.enableCloudMessage();
            }
        },

        enableCloudMessage: function(){
            $("#services_table").hide();
            $("#service_menu").hide();
            $("#clouds_disabled").show();
        },

        enableCloud: function(cloudPolicies, provider){
            //debugger
            var check = false;
            //Admin check
            if(JSON.parse(sessionStorage.permissions).length > 0){
                check = false;
            }else{
                if(cloudPolicies[0].group_policy.aws_governance.enabled_cloud.toLowerCase() === provider){
                    check = false;
                } else if(cloudPolicies[0].group_policy.os_governance.enabled_cloud.toLowerCase() === provider){
                    check = false;
                } else{
                    check = true;
                }
            }
            return check;
        },

        addToCarousel: function(provider){
            $('#cloud_coverflow').append($("<img></img>")
                .attr({
                    "id": provider,
                    "class" : "cover_flow_cloud",
                    "src": this.cloudDefinitions[provider].logo
            }));
        },
        addCloud: function( cloudCredential ) {
            //debugger
            var cloudProvider = cloudCredential.get("cloud_provider");
            var resourceNav = this;
            var cloudPolicies = JSON.parse(sessionStorage.group_policies);      
            if(cloudProvider) {
                cloudProvider = cloudProvider.toLowerCase();
                var found = false;
                var selected_cloud = sessionStorage['selected_cloud'];
                //Check if cloud is enabled before adding to coverflow
                if(cloudPolicies.length > 0){
                    found = this.enableCloud(cloudPolicies,cloudProvider);
                }
                //Google Hack until google policy feature is added. Remove after.
                if(cloudProvider === "google"){
                    found = false;
                }
                $.each($("#cloud_coverflow").children(), function (index, coverFlowCloud) {
                    if(coverFlowCloud.id === cloudProvider ) {
                        found = true;
                    }
                });
                if(!found) {
                    this.addToCarousel(cloudProvider);
                }
            }

            //Setup coverflow after logos have been added
            $("#cloud_coverflow").coverscroll({
                'minfactor':18, // how much is the next item smaller than previous in pixels
                'distribution':1, // how apart are the items (items become separated when this value is below 1)
                'scalethreshold':0, // after how many items to start scaling
                'staticbelowthreshold':false, // if true when number of items is below "scalethreshold" - don't animate
                'titleclass':'itemTitle', // class name of the element containing the item title
                'selectedclass':'selectedItem', // class name of the selected item
                'scrollactive':true, // scroll functionality switch
                'step':{ // compressed items on the side are steps
                    'limit':4, // how many steps should be shown on each side
                    'width':8, // how wide is the visible section of the step in pixels
                    'scale':true // scale down steps
                },
                'bendamount':2, // amount of "bending" of the CoverScroll (values 0.1 to 1 bend down, -0.1 to -1 bend up, 2 is straight (no bending), 1.5 sligtly bends down)
                'movecallback':function(item) {
                    if( $(item).attr("id") !== resourceNav.cloudProvider )
                    {
                        //debugger
                        var select = resourceNav.cloudProvider;
                        var leftAttr = $("#cloud_coverflow").children().first().attr('id');
                        var rightAttr = $("#cloud_coverflow").children().last().attr('id');
                        if(select === leftAttr){
                            $("#cloud_coverflow").coverscroll("prev");
                        }else if(select === rightAttr){
                            $("#cloud_coverflow").coverscroll("next");
                        }
                    }
                } // callback function triggered after click on an item - parameter is the item's jQuery object
            });
        },

        addAllClouds: function() {
            this.cloudCredentials.each(this.addCloud, this);
        },

        displayCloudChangeMessage: function(){
            $("#service_menu").hide();
            $("#resource_app").hide();
            $("#resource_not_opened").show();
        },

        cloudChange: function(event) {
            if(!event.isTrigger) {
                $(".resources").remove();
                Common.router.navigate("#resources/"+event.target.id, {trigger: false});
                this.cloudSelection(event.target.id);
                this.displayCloudChangeMessage();
            }
        },

        populateResourceTable: function(row, service, enabled_services, table){
            //debugger
            if(enabled_services){
                if(enabled_services instanceof Array){
                    if($.inArray(service.name, enabled_services) === -1){
                        return row;
                    }
                }else if(service.name !== enabled_services){
                   return row; 
                }
            }
            if(enabled_services === undefined){
                return row;
            }        
            $(table+row).append($("<td></td>").attr({
                "id": service.type,
                "class": "resources selectable_item"
            }));
            $("#"+service.type).append($("<a></a>").attr({
                "id": service.type+"Link",
                "class": "resource_link"
            }).text(service.name));
            row++;
            //reset row if greater than 3
            if(row > 3) {
                row = 1;
            }
            return row;
        },
        cloudSelectionIterator: function(collection,formElement){
            //debugger
            var resourceNav = this;
            var provider = resourceNav.cloudProvider;
            var permissions = JSON.parse(sessionStorage.permissions);
            var governance = JSON.parse(sessionStorage.group_policies);
            //Google Hack until Google governance is added.
            var googleHack = collection;      
            var row = 1;
            $.each(collection, function(index, service) {
                //debugger
                if(permissions.length > 0 || governance.length < 1){
                    row = resourceNav.populateResourceTable(row,service,false, formElement );
                }else if(formElement === "#topstack_row" && governance.length > 0){
                    var topstack_enabled_services = governance[0].group_policy.os_governance.enabled_services;
                    row = resourceNav.populateResourceTable(row,service,topstack_enabled_services,formElement);
                }else if(googleHack.length === 4){
                    row = resourceNav.populateResourceTable(row,service,false,formElement);
                }
                else{
                    $.each(governance, function(index,value){
                        //debugger
                        if(value != null){
                            $.each(value.group_policy, function(i,policy){
                                if(policy.hasOwnProperty('enabled_cloud')){
                                    if(policy.enabled_cloud.toLowerCase() === resourceNav.cloudProvider){
                                            row = resourceNav.populateResourceTable(row,service,policy.enabled_services, formElement );
                                    }
                                }
                            });
                        }
                    });
                }
            });           
        },

        cloudSelection: function (cloudProvider) {
            //debugger
            this.cloudProvider = cloudProvider;
            sessionStorage['selected_cloud'] = this.cloudProvider;
            var resourceNav = this;
            var topstack_enabled = resourceNav.cloudDefinitions[this.cloudProvider].topstack_services;
            //Add the services of the cloud to the resource table
            $("#resource_table").empty();
            this.cloudSelectionIterator(resourceNav.cloudDefinitions[this.cloudProvider].native_services,"#native_row");
            //debugger
            if(topstack_enabled !== undefined) {
                $("#topstack_services_table, #topstack_service_label").show();
                $("#native_services_table").css("width", "30%");
                $("#topstack_services_table").css("width", "60%");
                this.cloudSelectionIterator(topstack_enabled,"#topstack_row");
            }
            if( $("#topstack_row1").children().length < 1) {
                 $("#topstack_services_table, #topstack_service_label").hide();
                 $("#native_services_table").css("width", "90%");
            }
            if($("#native_row1").children().length < 1){
                $("#native_services_table, #native_service_label").hide();
                $("#topstack_services_table").css("width", "90%");
            }

            $("#cloud_nav").html(this.crumbTemplate({pathElt: this.cloudDefinitions[this.cloudProvider].name}));
            this.refreshCloudSpecs();

            // if(this.cloudProvider === "vcloud") {
            //     this.loadDataCenters();
            // }
        },

        credentialChange: function(event) {
            this.selectedCredential = event.target.value;

            sessionStorage['selected_cred_'+this.cloudProvider] = this.selectedCredential;

            $("#service_menu").hide();
            $("#resource_app").hide();
            $("#resource_not_opened").show();

            this.refreshCloudSpecs();
        },

        refreshCloudSpecs: function() {
            this.refreshCredentials();
            this.refreshRegions();
        },

        refreshCredentials: function() {
            var resourceNav = this;
            var credentialFound = false;
            //Remove previous credentials
            $("#credentials").remove();
            $("#cloud_specs").append('<div id="credentials" class="col-lg-4 spec_select">Credentials: <select id="credential_select" class="cloud_spec_select form-control"></select></div>');
            //Add credentials for this cloud
            this.cloudCredentials.each(function (credential) {
                if(credential.get("cloud_provider").toLowerCase() === resourceNav.cloudProvider) {
                    if(resourceNav.selectedCredential === credential.get("id")) {
                        $('#credential_select').append($("<option value='" + credential.get("id") + "' selected></option>").text(credential.get("name")));
                        $("#credential_nav").html(credential.get("name"));
                        credentialFound = true;
                    }else {
                        $('#credential_select').append($("<option value='" + credential.get("id") + "'></option>").text(credential.get("name")));
                    }
                }
            });

            if(!credentialFound) {
                $("#credential_nav").html($("#credential_select option:first").text());
                this.selectedCredential = $("#credential_select option:first").val();
            }

            if(sessionStorage['selected_cred_'+this.cloudProvider] !== undefined){
                $("#credential_select").val(sessionStorage['selected_cred_'+this.cloudProvider]);
                $("#credential_nav").html($("#credential_select option:selected").text());
                this.selectedCredential = $("#credential_select option:selected").val();
            }
        },

        refreshRegions: function() {
            var resourceNav = this;
            var regionFound = false;
            //Remove previous region
            $("#regions").remove();
            //Add regions if cloud has regions
            if(resourceNav.cloudDefinitions[this.cloudProvider].regions.length) {
                $("#cloud_specs").append('<div id="regions" class="col-lg-4 spec_select">Region: <select id="region_select" class="cloud_spec_select form-control"></select></div>');
                $.each(resourceNav.cloudDefinitions[this.cloudProvider].regions, function(index, region) {
                    //regions check
                    var addRegion = false;
                    if(JSON.parse(sessionStorage.group_policies)[0] == null){
                        addRegion = true;
                    }else{
                        $.each(JSON.parse(sessionStorage.group_policies), function(index,value){
                            if(value != null){
                                var usable_regions = value.group_policy.aws_governance.usable_regions;
                                if($.inArray(region.name, usable_regions) !== -1){
                                    addRegion = true;
                                }
                            }
                        });
                    }
                    var cname = location.href.split("#resources/")[1].split("/")[0];
                    if(!addRegion && cname === "aws"){

                    }
                    else if(resourceNav.selectedRegion === region.zone) {
                        $('#region_select').append($("<option value='" + region.zone + "' selected></option>").text(region.name));
                        $("#region_nav").html(resourceNav.crumbTemplate(
                                {pathElt: region.name}));
                        regionFound = true;
                    }else {
                        $('#region_select').append($("<option value='" + region.zone + "'></option>").text(region.name));
                    }
                });
                $("#region_select").change(function() {
                    resourceNav.selectedRegion = $("#region_select").val();
                    resourceNav.refreshCloudSpecs();
                    resourceNav.refreshPath();
                    resourceNav.render();
                });

                if(!regionFound) {
                    $("#region_nav").html(resourceNav.crumbTemplate(
                            {pathElt: $("#region_select option:first").text()}));
                    this.selectedRegion = $("#region_select option:first").val();
                }
                $("#region_nav").show();
            }else {
                this.selectedRegion = undefined;
                $("region_nav").hide();
            }
        },

        loadDataCenters : function ( cb ) {

            var View = this;
            var DataCenters = this.DataCenters;
            DataCenters = new DataCenters();

            DataCenters.fetch({
                data : {
                    cred_id : View.selectedCredential
                },
                success : function ( vdcs ) {
                    View.dataCenters = vdcs;

                    // var vcloudPath = '/js/vcloud/views/compute/vcloudTreeView.js';

                    var $centers = $('<div id="dataCenters" class="col-lg-4 spec_select">Data Center: </div>')
                        , $select = $('<select id="data_center_select" class="cloud_spec_select form-control"></select>');

                    $.each(vdcs.models, function ( index, vdc ) {
                        $select.append('<option value="' + vdc.attributes.id + '">' + vdc.attributes.name + '</option>');
                    });

                    $select.change(function () {
                        View.selectedDataCenter = $(this).val();
                        View.render();
                    });

                    $centers.append($select);
                    $("#cloud_specs").append($centers);

                    View.selectedDataCenter = $select.val();

                    if(cb) {
                        cb.call(this);
                    }
                }
            });
        },

        resourceClick: function(id) {
            //debugger
            $("#resource_not_opened").hide();
            $("#resource_app").show();
            var selectionId = id.target.id.split("Link")[0];
            this.type = selectionId;
            this.subtype = undefined;
            this.resourceSelect(selectionId);
            this.render();
        },

        resourceSelect: function(selectionId) {
            var view = this;
            $('.resources').each(function() {
                var selection = selectionId + "Link";
                if(selection === $(this).find(":first").attr("id")) {
                    $(this).addClass("selected_item");
                    $("#service_nav").html(view.crumbTemplate(
                            {pathElt: $(this).text()}));
                }else {
                    $(this).removeClass("selected_item");
                }
            });
        },

        loadResourceApp: function() {
            var resourceNav = this;
            var serviceObject;
            if(this.cloudProvider) {
                if (!this.selectedRegion) {
                    try {
                        this.selectedRegion = this.cloudDefinitions[this.cloudProvider].regions[0].zone;
                    }catch(error) {

                    }
                }
                if (!this.type) {
                    this.type = $(".resources").find(":first").attr("id").split("L")[0];
                    //this.type = "compute";
                    //this.subtype = "instances";
                }
                var completeServices = this.cloudDefinitions[this.cloudProvider].native_services;
                if(resourceNav.cloudDefinitions[this.cloudProvider].topstack_services !== undefined && resourceNav.cloudDefinitions[this.cloudProvider].topstack_services.length > 0) {
                    completeServices = completeServices.concat(resourceNav.cloudDefinitions[this.cloudProvider].topstack_services);
                }
                $.each(completeServices, function(index, service) {
                    if (service.type === resourceNav.type) {
                        if(!resourceNav.subtype) {
                            resourceNav.subtype = service.defaultSubtype;
                        }
                        serviceObject = service;
                    }
                });
                //Load SubServiceMenu if applies
                if(serviceObject && serviceObject.hasOwnProperty("subServices") && serviceObject.subServices.length > 0) {
                    this.subServiceMenu.render({service: serviceObject, cloudProvider: this.cloudProvider, region: this.selectedRegion, selectedSubtype: this.subtype});
                    $("#resource_app").addClass("service_width");
                    $("#resource_app").removeClass("full_width");
                    $("#service_menu").show();
                }else {
                    $("#service_menu").hide();
                    //$("#resource_app").width("1100px");
                    $("#resource_app").addClass("full_width");
                    $("#resource_app").removeClass("service_width");
                }

                var appPath;
                //Camelcase the subtype for the file name
                var split = this.subtype.split("_"),
                    subType,
                    camelCase;

                _.each(split, function(s) {
                    camelCase = s.charAt(0).toUpperCase() + s.slice(1);
                    subType = subType ? (subType + camelCase) : camelCase;
                });


                if(this.type === "admin") {
                    appPath = "../topstack/views/"+this.type+"/topstack"+subType+"AppView";
                }else {
                    var folder;

                    if(serviceObject && serviceObject.useSubServiceFolderNames) {
                        folder = _.find(serviceObject.subServices, { type : subType.toLowerCase() }).folder;
                        this.subServiceFolder = folder;
                    } else {
                        folder = this.type;
                    }

                    appPath = "../"+this.cloudProvider+"/views/"+folder+"/"+this.cloudProvider+subType+"AppView";
                }

                this.loadAppView(appPath);
            }
        },

        loadAppView : function ( view ) {
            var resourceNav = this;
            require([view], function ( AppView ) {
                if (resourceNav.resourceApp instanceof AppView) {
                    resourceNav.resourceApp.credentialId = resourceNav.selectedCredential;
                    if(resourceNav.selectedRegion) {
                        resourceNav.resourceApp.region = resourceNav.selectedRegion;
                    }else {
                        resourceNav.resourceApp.region = undefined;
                    }
                    resourceNav.resourceApp.render();
                    return;
                }

                var resourceAppView = new AppView({navView: resourceNav,cred_id: resourceNav.selectedCredential, region: resourceNav.selectedRegion, data_center : resourceNav.selectedDataCenter});
                resourceAppView.cloudProvider = resourceNav.cloudProvider;
                resourceNav.resourceApp = resourceAppView;
                resourceNav.resourceSelect(resourceNav.type);
                resourceNav.refreshPath();
            });
        },

        refreshPath: function() {
            if(this.resourceId) {
                Common.router.navigate("#resources/"+this.cloudProvider+"/"+this.selectedRegion+"/"+this.type+"/"+this.subtype+"/"+this.resourceId, {trigger: false});
                this.resourceApp.selectedId = this.resourceId;
            }else {
                Common.router.navigate("#resources/"+this.cloudProvider+"/"+this.selectedRegion+"/"+(this.subServiceFolder || this.type)+"/"+this.subtype, {trigger: false});
            }
        },

        close: function(){
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

    var resourcesView;

    Common.router.on('route:resources', function (cloud, region, type, subtype, id) {
        if(sessionStorage.account_id) {
            if(JSON.parse(sessionStorage.cloud_credentials).length <= 0){
                Common.router.navigate("#account/management/cloud-credentials_list", {trigger: true});
                Common.errorDialog("Credentials Error", "You must enter your Cloud Credentials to view Cloud Resources.");
            }
            if (this.previousView !== resourcesView) {
                this.unloadPreviousState();
                resourcesView = new ResourcesView();
                this.setPreviousState(resourcesView);
            }
            resourcesView.cloudProvider = cloud;
            resourcesView.selectedRegion = region;
            resourcesView.type = type;
            resourcesView.subtype = subtype;
            resourcesView.resourceId = id;
            resourcesView.render();
        }else {
            Common.router.navigate("", {trigger: true});
            Common.errorDialog("Login Error", "You must login.");
        }
    }, Common);

    return ResourcesView;
});
