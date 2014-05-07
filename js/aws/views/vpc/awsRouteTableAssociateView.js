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
        'views/dialogView',
        'text!templates/aws/vpc/awsRouteTableAssociateTemplate.html',
        '/js/aws/collections/vpc/awsSubnets.js',
        'icanhaz',
        'common',
        'jquery.multiselect',
        'jquery.multiselect.filter'
        
], function( $, _, Backbone, DialogView, routeTableAssociateTemplate, Subnets, ich, Common ) {
			
    /**
     * RouteTableCreateView is UI form to create compute.
     *
     * @name RouteTableCreateView
     * @constructor
     * @category RouteTable
     * @param {Object} initialization object.
     * @returns {Object} Returns a RouteTableCreateView instance.
     */
	
	var RouteTableAssociateView = DialogView.extend({

        credentialId: undefined,

        region: undefined,

        subnets: new Subnets(),

		template: _.template(routeTableAssociateTemplate),

		// Delegated events for creating new instances, etc.
		events: {
			"dialogclose": "close"
		},

		initialize: function(options) {
			//TODO
            this.credentialId = options.cred_id;
            this.region = options.region;
            this.routeTable = options.routeTable;
            this.render();
		},

		render: function() {
			var createView = this;
            this.$el.html(this.template);

            this.$el.dialog({
                autoOpen: true,
                title: "Associate Route Table",
                width:500,
                minHeight: 150,
                resizable: false,
                modal: true,
                buttons: {
                    Associate: function () {
                        createView.associate();
                    },
                    Cancel: function() {
                        createView.cancel();
                    }
                }
                
            });
           
            this.subnets.on( 'reset', this.addAllSubnets, this );
            this.subnets.fetch({ data: $.param({ cred_id: this.credentialId, region: this.region }), reset: true });
		},
		
        addAllSubnets: function() {
            $("#subnet_select").empty();
            this.subnets.each(function(subnet) {
                $("#subnet_select").append($("<option value=" + subnet.attributes.subnet_id + ">" + subnet.attributes.subnet_id + "</option>"));
            });
        },

		associate: function() {
			var routeTable = this.routeTable;
            var options = {};
            var issue = false;

            //Validate and create
            if($("#subnet_select").val !== null && $("#subnet_select").val() !== "") {
                options.subnet_id = $("#subnet_select").val();
            }else {
                issue = true;
            }

            if(!issue) {
                routeTable.associate(options, this.credentialId, this.region);
                this.$el.dialog('close');
            }else {
                Common.errorDialog("Invalid Request", "Please supply all required fields.");
            }
		}

	});
    
	return RouteTableAssociateView;
});
