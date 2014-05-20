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
        'common'
], function( $, _, Backbone, subServiceMenuTemplate, Common ) {
    'use strict';

    var SubServiceMenu = Backbone.View.extend({
        tagName: 'div',

        template: _.template(subServiceMenuTemplate),

        cloudProvider: undefined,

        region: undefined,

        service: undefined,

        menuOpen: true,

        events: {
            "click #menu_toggle_button": "toggleMenu",
            "click .subservice": "selectSubService"
        },

        initialize: function() {
            this.$el.html(this.template);
        },

        render: function(options) {
            $("#service_menu").html(this.$el);
            $("#subservice_menu_list").empty();
            if(options) {
                this.service = options.service;
                this.cloudProvider = options.cloudProvider;
                this.region = options.region;
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
            this.delegateEvents();
        },

        selectSubService: function( click ) {
            var viewOptions = [
                this.cloudProvider,
                this.region,
                this.service.type,
                click.target.id
            ].filter(Boolean);
            var route = ['#resources'].concat(viewOptions).join('/');

            this.clearSelection();
            $(click.target).addClass("selected_item");
            Common.router.navigate(route, {trigger: true});
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
            //$("#resource_app").width("890px");
            $("#resource_app").addClass("service_width");
            $("#resource_app").removeClass("full_width");
            $("#subservice_menu").show();
            $("#menu_toggle_button a span").removeClass("ui-icon-arrowthick-1-e");
            $("#menu_toggle_button a span").addClass("ui-icon-arrowthick-1-w");
        },

        closeMenu: function() {
            $("#subservice_menu").hide();
            //$("#service_menu").addClass("span1");
            //$("#resource_app").width("1079px");
            $("#resource_app").removeClass("service_width");
            $("#resource_app").addClass("full_width");
            $("#menu_toggle_button a span").removeClass("ui-icon-arrowthick-1-w");
            $("#menu_toggle_button a span").addClass("ui-icon-arrowthick-1-e");
        }
    });

    return SubServiceMenu;
});
