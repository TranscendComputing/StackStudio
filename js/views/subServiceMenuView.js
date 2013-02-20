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
        'text!templates/subServiceMenuTemplate.html',
        'common',
        'wijmo-actual'
], function( $, _, Backbone, subServiceMenuTemplate, Common ) {
    'use strict';

    var SubServiceMenu = Backbone.View.extend({
        tagName: 'div',
        
        template: _.template(subServiceMenuTemplate),
        
        cloudProvider: undefined,
        
        service: undefined,
        
        menuOpen: true,
        
        events: {
            "click #menu_toggle_button": "toggleMenu",
            "click .subservice": "selectSubService"
        },

        initialize: function() {
            this.$el.html(this.template);
            $("#service_menu").html(this.$el);
        },
        
        render: function(options) {
            $("#subservice_menu_list").empty();
            if(options) {
                this.service = options.service;
                this.cloudProvider = options.cloudProvider;
                $("#subservice_menu_title").html(this.service.name);
                // Build Menu
                $.each(options.service.subServices, function(index, subService) {
                    if(subService.type === options.selectedSubtype) {
                        $("#subservice_menu_list").append("<li class='subservice selected_item' id='"+subService.type+"'>"+subService.name+"</li>");
                    }else {
                        $("#subservice_menu_list").append("<li class='subservice' id='"+subService.type+"'>"+subService.name+"</li>");
                    }
                });
            }
            this.openMenu();
            
        },
        
        selectSubService: function( click ) {
            this.clearSelection();
            $(click.target).addClass("selected_item");
            
            Common.router.navigate("#resources/"+this.cloudProvider+"/"+this.service.type+"/"+click.target.id, {trigger: true});
        },
        
        clearSelection: function() {
            $("#subservice_menu_list li").each(function() {
               $(this).removeClass("selected_item");
            });
        },
        
        toggleMenu: function() {
            if(this.menuOpen) {
                this.closeMenu();
                this.menuOpen = false;
            } else {
                this.openMenu();
                this.menuOpen = true;
            }
        },
        
        openMenu: function() {
            $("#resource_app").width("890px");
            $("#subservice_menu").show();
            $("#menu_toggle_button a span").removeClass("ui-icon-arrowthick-1-e");
            $("#menu_toggle_button a span").addClass("ui-icon-arrowthick-1-w");
        },
        
        closeMenu: function() {
            $("#subservice_menu").hide();
            $("#resource_app").width("1079px");
            $("#menu_toggle_button a span").removeClass("ui-icon-arrowthick-1-w");
            $("#menu_toggle_button a span").addClass("ui-icon-arrowthick-1-e");
        },
        
        selectSubType: function() {
            
        }
    });
    
    return SubServiceMenu;
});
