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
	
	var VpcCreateView = DialogView.extend({
		
        credentialId: undefined,

        region: undefined,

		template: _.template(vpcCreateTemplate),
		
        vpc: new Vpc(),

		events: {
			"dialogclose": "close"
		},

		initialize: function(options) {
			this.credentialId = options.cred_id;
            this.region = options.region;
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
            $("#tenancy_select").selectmenu();
		},

		render: function() {
			
		},
		
		create: function() {
            var newVpc = this.vpc;
            var options = {};
            var issue = false;
			//Validate and create

            if($("#cidr_block_input").val() !== "") {
                options.CidrBlock = $("#cidr_block_input").val();
                options.InstanceTenancy = $("#tenancy_select").val();
            }else {
                issue = true;
            }

            if(!issue) {
                newVpc.create(options, this.credentialId, this.region);
                this.$el.dialog('close');
            }else {
                Common.errorDialog("Invalid Request", "Please supply all required fields.");
            } 
		}

	});
    
	return VpcCreateView;
});
