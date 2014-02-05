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
        'views/resource/resourceAppView',
        'text!templates/openstack/network/openstackRouterAppTemplate.html',
        '/js/openstack/models/network/openstackRouter.js',
        '/js/openstack/collections/network/openstackRouters.js',
        '/js/openstack/collections/network/openstackPorts.js',
        '/js/openstack/views/network/openstackRouterCreateView.js',
        '/js/openstack/views/network/openstackRouterInterfaceCreateView.js',
        'icanhaz',
        'common'
], function( $, _, Backbone, AppView, openstackRouterAppTemplate, Router, Routers, Ports, OpenstackRouterCreateView, OpenstackRouterInterfaceCreateView, ich, Common ) {
	'use strict';

	// Openstack Application View
	// ------------------------------

    /**
     * Openstack AppView is UI view list of cloud items.
     *
     * @name AppView
     * @constructor
     * @category Resources
     * @param {Object} initialization object.
     * @returns {Object} Returns an OpenstackAppView instance.
     */
	var OpenstackRoutersAppView = AppView.extend({
	    template: _.template(openstackRouterAppTemplate),
	    
        modelStringIdentifier: "id",
        
        columns: ["name", "id", "status"],
        
        idColumnNumber: 1,
        
        model: Router,
        
        collectionType: Routers,
        
        type: "network",
        
        subtype: "routers",
        
        CreateView: OpenstackRouterCreateView,
        
        events: {
            'click .create_button': 'createNew',
            'click #action_menu ul li': 'performAction',
            'click #resource_table tr': "clickOne"
        },

        initialize: function(options) {
            if(options.cred_id) {
                this.credentialId = options.cred_id;
            }
            if(options.region) {
                this.region = options.region;
            }
            this.ports = new Ports();
            if(this.region && this.credentialId){
                this.ports.fetch({ data: $.param({ cred_id: this.credentialId, region: this.region}), reset: true });
            }
            this.render();
            var routerApp = this;
            Common.vent.on("routerAppRefresh", function() {
                routerApp.render();
            });
        },
        
        toggleActions: function(e) {
            //Disable any needed actions
            var actionsMenu = $("#action_menu").menu("option", "menus");
            _.each($("#action_menu").find(actionsMenu).find("li"), function(item){
                var actionItem = $(item);
                if(actionItem.text() === "Add Router Interface" )
                {
                    this.toggleActionItem(actionItem, this.hasInterface() !== null);
                }
                if(actionItem.text() === "Remove Router Interface")
                {
                    this.toggleActionItem(actionItem, this.hasInterface() === null);
                }
            }, this);
        },
        hasInterface: function() {
            // debugger
            var router = this.collection.get(this.selectedId);
            var routerID = router.id;
            var check = null;
            this.ports.each(function(port) {
                // debugger
                if(port.attributes.device_id === routerID){
                    check = port;
                }
            });
            return check;
        },
        performAction: function(event) {
            var router = this.collection.get(this.selectedId);
            
            switch(event.target.text)
            {
            case "Delete Router":
                router.destroy(this.credentialId);
                break;
            case "Add Router Interface":
                new OpenstackRouterInterfaceCreateView({cred_id: this.credentialId, router: router});
                break;
            case "Remove Router Interface":
                router.removeInterface(this.credentialId);
                break;
            }

        }
	});
    
	return OpenstackRoutersAppView;
});
