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
        'backbone',
        'icanhaz',
        'common',
        'text!templates/resources/resourcesTemplate.html',
        'text!templates/resources/breadcrumb.html',
        'models/cloudCredential',
        'collections/cloudCredentials',
        'views/resource/subServiceMenuView',
        'jquery-plugins',
        'jquery-ui-plugins'
], function( $, _, Backbone, ich, Common, resourcesTemplate, breadcrumbTemplate,
        cloudCredential, CloudCredentials, SubServiceMenuView ) {
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
            $("#resource_summary").accordion({
                collapsible: true,
                heightStyle: "content"
            });
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
                if(this.resourceApp) {
                    this.resourceApp.remove();
                } else {

                    // var firstCloudProvider = this.cloudCredentials.first().attributes.cloud_provider;
                    // firstCloudProvider = firstCloudProvider.toLowerCase();
                    var firstCloudProvider = $("#cloud_coverflow").children()[0].id;
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
                this.loadResourceApp();
            }else{
                this.enableCloudMessage();
            }
        },

        enableCloudMessage: function(){
            $("#cloud_enabled").hide();
            $("#service_menu").hide();
            $("#clouds_disabled").show();
        },

        enableCloud: function(cloudPolicies, provider){
            var check = false;
            if(cloudPolicies.length < 1 || JSON.parse(sessionStorage.permissions).length > 0){
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

        addCloud: function( cloudCredential ) {
            var cloudProvider = cloudCredential.get("cloud_provider");
            var resourceNav = this;
            var cloudPolicies = JSON.parse(sessionStorage.group_policies);
            if(cloudProvider) {
                cloudProvider = cloudProvider.toLowerCase();
                var found = false;
                // debugger
                //check if cloud is enabled.
                found = this.enableCloud(cloudPolicies, cloudProvider);
                // debugger
                $.each($("#cloud_coverflow").children(), function (index, coverFlowCloud) {
                    if(coverFlowCloud.id === cloudProvider ) {
                        found = true;
                    }
                });
                if(!found) {
                    $('#cloud_coverflow').append($("<img></img>")
                        .attr({
                            "id": cloudProvider,
                            "class" : "cover_flow_cloud",
                            "src": resourceNav.cloudDefinitions[cloudProvider].logo
                    }));
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
                        if(resourceNav.cloudProvider === "aws"){
                            $("#cloud_coverflow").coverscroll("prev");
                        }else if(resourceNav.cloudProvider === "google"){
                            $("#cloud_coverflow").coverscroll("next");
                        }
                        //$("#cloud_coverflow").coverscroll("prev");
                    }
                } // callback function triggered after click on an item - parameter is the item's jQuery object
            });
        },

        addAllClouds: function() {
            this.cloudCredentials.each(this.addCloud, this);
        },

        cloudChange: function(event) {
            if(!event.isTrigger) {
                $(".resources").remove();
                Common.router.navigate("#resources/"+event.target.id, {trigger: false});
                this.cloudSelection(event.target.id);
                $("#service_menu").hide();
                $("#resource_app").hide();
                $("#resource_not_opened").show();
            }
        },

        cloudSelection: function (cloudProvider) {
            this.cloudProvider = cloudProvider;
            sessionStorage['selected_cloud'] = this.cloudProvider;
            var resourceNav = this;
            var enabled_services = [];
            var enabled_services_os = [];
            var topstack_enabled = resourceNav.cloudDefinitions[this.cloudProvider].topstack_services;
            var permissions = JSON.parse(sessionStorage.permissions);
            var no_governance = JSON.parse(sessionStorage.group_policies);
            //Add the services of the cloud to the resource table
            var row = 1;
            $("#resource_table").empty();
            $.each(resourceNav.cloudDefinitions[this.cloudProvider].native_services, function(index, service) {
                //Check Enabled Services
                var addService = false;
                var addServiceOS = false;
                if(permissions.length > 0 || no_governance.length < 1){
                    addService = true;
                    addServiceOS = true;
                    enabled_services_os = topstack_enabled;
                }else{
                    $.each(JSON.parse(sessionStorage.group_policies), function(index,value){
                        if(value != null){
                            enabled_services = value.group_policy.aws_governance.enabled_services;
                            enabled_services_os = value.group_policy.os_governance.enabled_services;
                            if($.inArray(service.name, enabled_services) !== -1){
                                addService = true;
                            }
                            if($.inArray(service.name, enabled_services_os) !== -1){
                                addServiceOS = true;
                            }
                        }
                    });
                }
                //hack
                var cname = location.href.split("#resources/")[1].split("/")[0];
                // debugger
                if(addService && cname === 'aws'){
                    $("#native_row"+row).append($("<td></td>").attr({
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
                }
                if(addServiceOS && cname === 'openstack'){
                    $("#native_row"+row).append($("<td></td>").attr({
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
                }
            });
            row = 1;
            if(topstack_enabled !== undefined && topstack_enabled.length > 0) {
                $("#topstack_services_table, #topstack_service_label").show();
                $("#native_services_table").css("width", "30%");
                $("#topstack_services_table").css("width", "60%");
                $.each(topstack_enabled, function(index, service) {
                    if($.inArray(service.name, enabled_services_os) !== -1 || permissions.length > 0 || no_governance.length < 1){
                        $("#topstack_row"+row).append($("<td></td>").attr({
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
                    }
                });
            }else {
                $("#topstack_services_table, #topstack_service_label").hide();
                $("#native_services_table").css("width", "90%");
            }

            $("#cloud_nav").html(this.crumbTemplate({pathElt: this.cloudDefinitions[this.cloudProvider].name}));

            this.refreshCloudSpecs();
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
                    this.type = "compute";
                    this.subtype = "instances";
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

                //Camelcase the subtype for the file name
                var split = this.subtype.split("_"),
                    subType,
                    camelCase;

                _.each(split, function(s) {
                    camelCase = s.charAt(0).toUpperCase() + s.slice(1);
                    subType = subType ? (subType + camelCase) : camelCase;
                });

                var appPath;

                if(this.type === "admin") {
                    appPath = "../topstack/views/"+this.type+"/topstack"+subType+"AppView";
                }else {
                    appPath = "../"+this.cloudProvider+"/views/"+this.type+"/"+this.cloudProvider+subType+"AppView";
                }

                require([appPath], function (AppView) {
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

                    var resourceAppView = new AppView({cred_id: resourceNav.selectedCredential, region: resourceNav.selectedRegion});
                    resourceAppView.cloudProvider = resourceNav.cloudProvider;
                    resourceNav.resourceApp = resourceAppView;
                    resourceNav.resourceSelect(resourceNav.type);
                    resourceNav.refreshPath();
                });
            }
        },

        refreshPath: function() {
            if(this.resourceId) {
                Common.router.navigate("#resources/"+this.cloudProvider+"/"+this.selectedRegion+"/"+this.type+"/"+this.subtype+"/"+this.resourceId, {trigger: false});
                this.resourceApp.selectedId = this.resourceId;
            }else {
                Common.router.navigate("#resources/"+this.cloudProvider+"/"+this.selectedRegion+"/"+this.type+"/"+this.subtype, {trigger: false});
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
