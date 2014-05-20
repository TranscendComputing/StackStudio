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
        'openstack/models/network/openstackRouter',
        'openstack/collections/network/openstackRouters',
        'openstack/collections/network/openstackPorts',
        'openstack/views/network/openstackRouterCreateView',
        'openstack/views/network/openstackRouterDestroyView',
        'openstack/views/network/openstackRouterInterfaceCreateView',
        'icanhaz',
        'common',
        'jquery.dataTables'
], function( $, _, Backbone, AppView, openstackRouterAppTemplate, Router, Routers, Ports, OpenstackRouterCreateView, OpenstackRouterDestroyView, OpenstackRouterInterfaceCreateView, ich, Common ) {
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
            'click #interfaces_table tr': 'clickInterface',
            'click #remove_interface_button': "clickRemoveInterface"
            
        },

        initialize: function(options) {
            if(options.cred_id) {
                this.credentialId = options.cred_id;
            }
            if(options.region) {
                this.region = options.region;
            }
            var routerApp = this;
            this.ports = new Ports();
            this.ports.on("reset", this.addAllInterfaces, this);
            this.ports.fetch({ data: $.param({ cred_id: this.credentialId, region: this.region}), reset: true });
            Common.vent.off("router:interfaceRefresh");
            Common.vent.on("router:interfaceRefresh", function() {
                //refetch ports
                routerApp.ports.fetch({
                    data: $.param({ cred_id: routerApp.credentialId, region: routerApp.region}),
                    reset: true
                });
                routerApp.render();
            });
            Common.vent.on("routerAppRefresh", function() {
                routerApp.render();
            });
            this.render();
        },
        
        toggleActions: function(e) {
            //Disable any needed actions
            this.addAllInterfaces();
            this.toggleButton($("#remove_interface_button"),true);
        },
        toggleButton: function(target, toggle){
            if(toggle === true){
                target.attr("disabled", true);
                target.addClass("ui-state-disabled");
            }else{
                target.removeAttr("disabled");
                target.removeClass("ui-state-disabled");
            }
        },
        addAllInterfaces: function(collection){
            if($("#interfaces_table").length !== 0){
                var router = this.collection.get(this.selectedId);
                var routerID = router.id;
                $("#interfaces_table").dataTable().fnClearTable();
                this.ports.each(function(port) {
                    if(port.attributes.device_id === routerID){
                        var rowData = [port.attributes.fixed_ips[0].subnet_id,port.attributes.fixed_ips[0].ip_address,port.attributes.id];
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
        clickAddInterface: function(){
            var router = this.collection.get(this.selectedId);
            new OpenstackRouterInterfaceCreateView({cred_id: this.credentialId, router: router});
        },
        clickRemoveInterface: function(target){
            var router = this.collection.get(this.selectedId);
            var options = {};
            options.subnet_id = this.selectedInterface[0];
            router.removeInterface(options, this.credentialId);
        },
        clickInterface: function(event){
            if($(event.target).parents('table').attr('id') === "interfaces_table" && ! $(event.target).hasClass("dataTables_empty") ){
                this.selectInterface(event.currentTarget);
            }
        },

        selectInterface: function(target){
            $(".row_selected").removeClass('row_selected');
            $(target).addClass('row_selected');
            this.toggleButton($("#remove_interface_button"),false);
            this.selectedInterface = $("#interfaces_table").dataTable().fnGetData(target);
        },

        performAction: function(event) {
            var router = this.collection.get(this.selectedId);
            switch(event.target.text)
            {
            case "Delete Router":
                if($("#interfaces_table").dataTable().fnGetData().length > 0){
                    new OpenstackRouterDestroyView({cred_id: this.credentialId, router: router});
                }else{
                    router.destroy(this.credentialId);
                }
                break;
            }

        }
	});
    
	return OpenstackRoutersAppView;
});
