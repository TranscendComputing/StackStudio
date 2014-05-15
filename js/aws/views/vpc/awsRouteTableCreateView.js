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
        'text!templates/aws/vpc/awsRouteTableCreateTemplate.html',
        'aws/collections/vpc/awsVpcs',
        'aws/models/vpc/awsRouteTable',
        'icanhaz',
        'common',
        'jquery.multiselect',
        'jquery.multiselect.filter'
        
], function( $, _, Backbone, DialogView, routeTableCreateTemplate, Vpcs, RouteTable, ich, Common ) {
			
    /**
     * RouteTableCreateView is UI form to create compute.
     *
     * @name RouteTableCreateView
     * @constructor
     * @category RouteTable
     * @param {Object} initialization object.
     * @returns {Object} Returns a RouteTableCreateView instance.
     */
	
	var RouteTableCreateView = DialogView.extend({

        credentialId: undefined,

        region: undefined,

        vpcs: new Vpcs(),

        routeTable: new RouteTable(),

		template: _.template(routeTableCreateTemplate),

		// Delegated events for creating new instances, etc.
		events: {
			"dialogclose": "close"
		},

		initialize: function(options) {
			//TODO
            this.credentialId = options.cred_id;
            this.region = options.region;
		},

		render: function() {
			var createView = this;
            this.$el.html(this.template);

            this.$el.dialog({
                autoOpen: true,
                title: "Create RouteTable",
                width:500,
                minHeight: 150,
                resizable: false,
                modal: true,
                buttons: {
                    Create: function () {
                        createView.create();
                    },
                    Cancel: function() {
                        createView.cancel();
                    }
                }
                
            });
           
            this.vpcs.on( 'reset', this.addAllVpcs, this );
            this.vpcs.fetch({ data: $.param({ cred_id: this.credentialId, region: this.region }), reset: true });
		},
		
        addAllVpcs: function() {
            $("#vpc_select").empty();
            this.vpcs.each(function(vpc) {
                $("#vpc_select").append($("<option value=" + vpc.attributes.id + ">" + vpc.attributes.id + "</option>"));
            });
        },

		create: function() {
			var routeTable = this.routeTable;
            var options = {};
            var issue = false;

            //Validate and create
            if($("#vpc_select").val !== null && $("#vpc_select").val() !== "") {
                options.vpc_id = $("#vpc_select").val();
            }else {
                issue = true;
            }

            if(!issue) {
                routeTable.create(options, this.credentialId, this.region);
                this.$el.dialog('close');
            }else {
                Common.errorDialog("Invalid Request", "Please supply all required fields.");
            }
		}

	});
    
	return RouteTableCreateView;
});
