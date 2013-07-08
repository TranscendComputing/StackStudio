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
            "selectmenuchange #credential_select": "credentialChange"
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
            if(this.resourceApp) {
                this.resourceApp.remove();
            } else {
                var firstCloudProvider = this.cloudCredentials.first().attributes.cloud_provider;
                firstCloudProvider = firstCloudProvider.toLowerCase();
                if(this.cloudProvider) {
                    if($("#"+this.cloudProvider).length) {
                        this.cloudSelection(this.cloudProvider);
                        Common.router.navigate("#resources/"+this.cloudProvider, {trigger: false});
                    }else {
                        Common.router.navigate("#resources/"+firstCloudProvider, {trigger: false});
                        this.cloudSelection(firstCloudProvider);
                    }
                }else {
                    Common.router.navigate("#resources/"+firstCloudProvider, {trigger: false});
                    this.cloudSelection(firstCloudProvider);
                }
            }
		    this.loadResourceApp();
		},

		addCloud: function( cloudCredential ) {
		    var cloudProvider = cloudCredential.get("cloud_provider");
		    var resourceNav = this;
			if(cloudProvider) {
			    cloudProvider = cloudProvider.toLowerCase();
			    var found = false;
				$.each($("#cloud_coverflow").children(), function (index, coverFlowCloud) {
				    if(coverFlowCloud.id === cloudProvider) {
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
                        $("#cloud_coverflow").coverscroll("next");
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
            }
		},

		cloudSelection: function (cloudProvider) {
            this.cloudProvider = cloudProvider;
		    var resourceNav = this;
		    //Add the services of the cloud to the resource table
		    var row = 1;
		    $("#resource_table").empty();
		    $.each(resourceNav.cloudDefinitions[this.cloudProvider].native_services, function(index, service) {
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
		    });
            row = 1;
            if(resourceNav.cloudDefinitions[this.cloudProvider].topstack_services != undefined && resourceNav.cloudDefinitions[this.cloudProvider].topstack_services.length > 0) {
                $("#topstack_services_table, #topstack_service_label").show();
                $("#native_services_table").css("width", "30%");
                $("#topstack_services_table").css("width", "42%");
                $.each(resourceNav.cloudDefinitions[this.cloudProvider].topstack_services, function(index, service) {
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
                });
            }else {
                $("#topstack_services_table, #topstack_service_label").hide();
                $("#native_services_table").css("width", "73%");
            }
            
		    $("#cloud_nav").html(this.crumbTemplate({pathElt: this.cloudDefinitions[this.cloudProvider].name}));

            this.refreshCloudSpecs();
		},

        /**
         *    Change handler for cloud credentials list
         *    @param  {selectmenuchange} event   [description]
         *    @param  {Object} object  {index: <int>, option: <object: option element itself>, value: <string: value of option>}
         */
        credentialChange: function(event, object) {
            this.selectedCredential = object.value;
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
            $("#cloud_specs").append('<span id="credentials">Credentials: <select id="credential_select" class="cloud_spec_select"></select></span>');
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
            $("#credential_select").selectmenu();

            if(!credentialFound) {
                $("#credential_nav").html($("#credential_select option:first").text());
                this.selectedCredential = $("#credential_select option:first").val();
            }
        },

        refreshRegions: function() {
            var resourceNav = this;
            var regionFound = false;
            //Remove previous region
            $("#regions").remove();
            //Add regions if cloud has regions
            if(resourceNav.cloudDefinitions[this.cloudProvider].regions.length) {
                $("#cloud_specs").append('<span id="regions">Region: <select id="region_select" class="cloud_spec_select"></select></span>');
                $.each(resourceNav.cloudDefinitions[this.cloudProvider].regions, function(index, region) {
                    if(resourceNav.selectedRegion === region.zone) {
                        $('#region_select').append($("<option value='" + region.zone + "' selected></option>").text(region.name));
                        $("#region_nav").html(resourceNav.crumbTemplate(
                                {pathElt: region.name}));
                        regionFound = true;
                    }else {
                        $('#region_select').append($("<option value='" + region.zone + "'></option>").text(region.name));
                    }
                });
                $("#region_select").selectmenu({
                    change: function() {
                        resourceNav.selectedRegion = $("#region_select").val();
                        resourceNav.refreshCloudSpecs();
                        resourceNav.refreshPath();
                        resourceNav.render();
                    }
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
                if(resourceNav.cloudDefinitions[this.cloudProvider].topstack_services != undefined && resourceNav.cloudDefinitions[this.cloudProvider].topstack_services.length > 0) {
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
                    $("#service_menu").show();
                }else {
                    $("#service_menu").hide();
                    $("#resource_app").width("1100px");
                }

                //Camelcase the subtype for the file name
                var split = this.subtype.split("_"),
                    subType,
                    camelCase;

                _.each(split, function(s) {
                    camelCase = s.charAt(0).toUpperCase() + s.slice(1);
                    subType = subType ? (subType + camelCase) : camelCase;
                });

                if(this.type === "admin") {
                    var appPath = "../topstack/views/"+this.type+"/topstack"+subType+"AppView";
                }else {
                    var appPath = "../"+this.cloudProvider+"/views/"+this.type+"/"+this.cloudProvider+subType+"AppView";
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
