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
        'common',
        'jquery.dataTables'
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
            'click #resource_table tr': "clickOne",
            'click #add_interface_button': "clickAddInterface",
            'click #interfaces_click': "clickInterfacesTab"
        },

        initialize: function(options) {
            if(options.cred_id) {
                this.credentialId = options.cred_id;
            }
            if(options.region) {
                this.region = options.region;
            }
            this.ports = new Ports();
            this.ports.on("reset", this.addAllInterfaces, this);
            this.ports.fetch({ data: $.param({ cred_id: this.credentialId, region: this.region}), reset: true });
            
            this.render();
            var routerApp = this;
            Common.vent.on("routerAppRefresh", function() {
                routerApp.render();
            });
        },
        
        toggleActions: function(e) {
            //Disable any needed actions
        },
        addAllInterfaces: function(collection){
            if($("#interfaces_table").length !== 0){
                var router = this.collection.get(this.selectedId);
                var routerID = router.id;
                $("#interfaces_table").dataTable().fnClearTable();
                this.ports.each(function(port) {
                    if(port.attributes.device_id === routerID){
                        var rowData = [port.attributes.fixed_ips[0].ip_address,port.attributes.fixed_ips[0].subnet_id];
                        $("#interfaces_table").dataTable().fnAddData(rowData);
                    }
                });
            }
        },
        hasInterface: function() {
            var router = this.collection.get(this.selectedId);
            var routerID = router.id;
            var check = null;
            this.ports.each(function(port) {
                if(port.attributes.device_id === routerID){
                    check = port;
                }
            });
            return check;
        },
        clickInterfacesTab: function(){
            this.addAllInterfaces();
        },
        clickAddInterface: function(){
            var router = this.collection.get(this.selectedId);
            new OpenstackRouterInterfaceCreateView({cred_id: this.credentialId, router: router});
        },

        performAction: function(event) {
            var router = this.collection.get(this.selectedId);
            
            switch(event.target.text)
            {
            case "Delete Router":
                router.destroy(this.credentialId);
                break;
            case "Remove Router Interface":
                router.removeInterface(this.credentialId);
                break;
            }

        }
	});
    
	return OpenstackRoutersAppView;
});
