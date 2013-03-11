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
        'text!templates/aws/vpc/awsVpcCreateTemplate.html',
        '/js/aws/models/vpc/awsVpc.js',
        'icanhaz',
        'common',
        'jquery.ui.selectmenu',
        'jquery.multiselect',
        'jquery.multiselect.filter'
        
], function( $, _, Backbone, DialogView, vpcCreateTemplate, Vpc, ich, Common ) {
	
	var tenancies = ["Default", "Dedicated"];
		
    /**
     * VpcCreateView is UI form to create compute.
     *
     * @name VpcCreateView
     * @constructor
     * @category Vpc
     * @param {Object} initialization object.
     * @returns {Object} Returns a VpcCreateView instance.
     */
	
	var VpcCreateView = DialogView.extend({
		
		template: _.template(vpcCreateTemplate),
		// Delegated events for creating new instances, etc.
		events: {
			"dialogclose": "close"
		},

		initialize: function() {
			//TODO
		},

		render: function() {
			var createView = this;
            this.$el.html(this.template);

            this.$el.dialog({
                autoOpen: true,
                title: "Create Vpc",
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
            
            $.each(tenancies, function (index, value) {
                $('#tenancy_select')
                    .append($("<option></option>")
                    .attr("value",index)
                    .text(value)); 
            });
            $("#tenancy_select").selectmenu();
           
            return this;
		},
		
		create: function() {
			//Validate and create
			this.$el.dialog('close');
		}

	});
    
	return VpcCreateView;
});
