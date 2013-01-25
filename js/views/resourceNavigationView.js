/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true requirejs:true require:true*/
define([
        'jquery',
        'underscore',
        'backbone',
        'icanhaz',
        'common',
        'text!templates/resources/resourcesTemplate.html',
        'models/cloudCredential',
        'collections/cloudCredentials',
        'jquery.coverscroll.min',
        'jquery.ui.selectmenu'
], function( $, _, Backbone, ich, Common, resourcesTemplate, cloudCredential, cloudCredentials ) {
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
		
		cloudPath: undefined,
		
		typePath: undefined,
		
		subtypePath:undefined,
		
		idPath: undefined,
		
        cloudDefinitions: undefined,
        
        navOpen: false,
        
        events: {
			"click .resourceLink" : "resourceClick",
			"click #cloud_coverflow img" : "cloudChange",
			"click #resource_summary" : "toggleResourceNav"
		},
        
		initialize: function() {
		    $("#main").append(this.el);
            this.$el.html(this.template);
            var response = $.ajax({
                url: "samples/cloudDefinitions.json",
                async: false
            }).responseText;
            this.cloudDefinitions = $.parseJSON(response);
            cloudCredentials.on('add', this.addCloud, this );
            cloudCredentials.on('reset', this.addAllClouds, this );
            
            //load user's cloud selections
            cloudCredentials.fetch();
		},
		
		render: function () {
		    this.loadResourceApp(this.selectedCloud, this.typePath, this.subtypePath, this.idPath);
		    return this;
		},
		
		toggleResourceNav: function() {
		    if(this.navOpen) {
                $("#resource_nav").hide();
                this.navOpen = false;
            }else {
                $("#resource_nav").show();
                this.navOpen = true;
            }
		},
		
		addCloud: function( cloudCredential ) {
		    var cloudProvider = cloudCredential.get("cloudProvider");
		    var resourceNav = this;
			if(cloudProvider) {
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
                'movecallback':function(item){} // callback function triggered after click on an item - parameter is the item's jQuery object
            });
		},
		
		addAllClouds: function() {
		    cloudCredentials.each(this.addCloud, this);
		    if(this.cloudPath) {
		        console.log("cloud path: "+this.cloudPath);
		        Common.router.navigate("#resources/"+this.cloudPath, {trigger: false});
		        if($("#"+this.cloudPath).length) {
		            this.cloudSelection(this.cloudPath);
		            Common.router.navigate("#resources/"+this.cloudPath, {trigger: false});
		        }else {
		            Common.router.navigate("#resources/"+cloudCredentials.first().attributes.cloudProvider, {trigger: false});
		            this.cloudSelection(cloudCredentials.first().attributes.cloudProvider);
		        }
		    }else {
		        console.log("cloud path undefined");
		        Common.router.navigate("#resources/"+cloudCredentials.first().attributes.cloudProvider, {trigger: false});
		        this.cloudSelection(cloudCredentials.first().attributes.cloudProvider);
		    }
		    $("#resource_nav").hide();
		},
		/*
		setNavToCoverFlowIndex: function () {
		    //Move coverflow to first to parse for correct cloud
		    var cloudCount = $("#cloud_coverflow").children().length;
		    var coverFlowIndex = 0;
		    if(cloudCount/2 % 2 === 0) {
		        coverFlowIndex = cloudCount/2 - 1;
		    }else {
		        coverFlowIndex = Math.floor(cloudCount/2);
		    }
		    
		    var coverFlowSelectedCloud = $("#cloud_coverflow").children()[coverFlowIndex].id;
		    Common.router.navigate("#resources/"+coverFlowSelectedCloud, {trigger: false});
		    
		},
        */
		cloudChange: function(event) {		
			$(".resources").remove();
			Common.router.navigate("#resources/"+event.target.id, {trigger: false});
			this.cloudSelection(event.target.id);
		},
		
		cloudSelection: function (cloudProvider) {
            this.selectedCloud = cloudProvider;
		    var resourceNav = this;
		    //Add the services of the cloud to the resource table
		    var row = 1;
		    $.each(resourceNav.cloudDefinitions[cloudProvider].services, function(index, service) {
		        $("#row"+row).append($("<td></td>").attr({
                    "id": service.type,
                    "class": "resources"
                }));
                $("#"+service.type).append($("<a></a>").attr({
                    "id": service.type+"Link",
                    "class": "resourceLink",
                    "href": "/#resources/"+cloudProvider+"/"+service.type
                }).text(service.name));
                row++;
                //reset row if greater than 3 
		        if(row > 3) {
		            row = 1;
		        }
		    });
		    
		    $("#cloud_nav").html(resourceNav.cloudDefinitions[cloudProvider].name+" ->");
		    
		    //Refresh previous select
		    $("#credentials").remove();
		    $("#cloud_specs").append('<span id="credentials">Credentials: <select id="credential_select" class="cloud_spec_select"></select></span>');
		    //Add credentials for this cloud
		    cloudCredentials.each(function (credential) {
		        if(credential.get("cloudProvider") === cloudProvider) {
		            $('#credential_select').append($("<option></option>").text(credential.get("name"))); 
		        }
		    });
            $("#credential_select").selectmenu();
            $("#credential_nav").html($("#credential_select option:first").text());
		    
		    //Remove previous region
            $("#regions").remove();
            //Add regions if cloud has regions
		    if(resourceNav.cloudDefinitions[cloudProvider].regions.length) {
                $("#cloud_specs").append('<span id="regions">Region: <select id="region_select" class="cloud_spec_select"></select></span>');
                $.each(resourceNav.cloudDefinitions[cloudProvider].regions, function(index, region) {
                    $('#region_select').append($("<option></option>").attr("value", region.zone).text(region.name));
                });
                $("#region_select").selectmenu();
                $("#region_nav").html($("#region_select option:first").text() + " ->");
                $("#region_nav").show();
		    }else {
		        $("region_nav").hide();
		    }
		    
		    this.loadResourceApp(cloudProvider, resourceNav.typePath, resourceNav.subtypePath, resourceNav.idPath);
		},
		
		resourceClick: function(id) {
			var selectionId = id.target.id;
			this.typePath = selectionId;
			this.resourceSelect(selectionId);
		},
		
		resourceSelect: function(selectionId) {
			$('.resources').each(function() {
			    var selection = selectionId + "Link";
				if(selection === $(this).find(":first").attr("id")) {
					$(this).css("background", "wheat");
					$("#service_nav").html($(this).text() + " ->");
				}else {
					$(this).css("background", "#E6E9ED");
				}
	        });
			console.log(selectionId + " selected");
		},
		
		loadResourceApp: function(cloudProvider, type, subtype, id) {
		    var resourceNav = this;
            if(cloudProvider) {
                if (!type) {
                    type = "compute";
                    subtype = "instances";
                } else if (!subtype) {
                    $.each(this.cloudDefinitions[cloudProvider].services, function(index, service) {
                        if (service.type === type) {
                            subtype = service.defaultSubtype;
                        }
                    });
                }
                
                //Capitalize first letter of subtype for the file name
                var capSubtype = subtype.charAt(0).toUpperCase() + subtype.slice(1); 
                var appPath = "../"+cloudProvider+"/views/"+type+"/"+cloudProvider+capSubtype+"AppView";

                require([appPath], function (AppView) {
                    if (this.resourceApp instanceof AppView) {
                        return;
                    }
                    var resourceAppView = new AppView();
                    this.resourceApp = resourceAppView;
                    resourceNav.resourceSelect(type);
                    if(id) {
                        Common.router.navigate("#resources/"+cloudProvider+"/"+type+"/"+subtype+"/"+id, {trigger: true});
                        resourceAppView.selectedId = id;
                    }else {
                        Common.router.navigate("#resources/"+cloudProvider+"/"+type+"/"+subtype, {trigger: true});
                    } 
                });
                
            }
        }
	});
	
	var resourcesView;
	
    Common.router.on('route:resources', function (cloud, type, subtype, id) {
        if (!resourcesView) {
            resourcesView = new ResourcesView();
        }
        resourcesView.cloudPath = cloud;
        resourcesView.typePath = type;
        resourcesView.subtypePath = subtype;
        resourcesView.idPath = id;
        resourcesView.render();
        console.log("resources view: resources route");
    }, this);

    console.log("resource view defined");

	return ResourcesView;
});
