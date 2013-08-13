/*!
 * (c) Copyright 2012-2013 Transcend Computing, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the License);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an AS IS BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
        'text!templates/aws/vpc/awsSubnetCreateTemplate.html',
        '/js/aws/models/vpc/awsSubnet.js',
        '/js/aws/collections/vpc/awsVpcs.js',
        '/js/aws/collections/compute/awsAvailabilityZones.js',
        'common',
        'jquery.ui.selectmenu'
        
], function( $, _, Backbone, DialogView, subnetCreateTemplate, Subnet, Vpcs, AvailabilityZones, Common ) {
	
	var SubnetCreateView = DialogView.extend({

        credentialId: undefined,

        region: undefined,

		template: _.template(subnetCreateTemplate),

        vpcs: new Vpcs(),

        availabilityZones: new AvailabilityZones(),

        subnet: new Subnet(),

		events: {
			"dialogclose": "close"
		},

		initialize: function(options) {
            this.credentialId = options.cred_id;
            this.region = options.region;
        },

		render: function() {
			var createView = this;
            this.$el.html(this.template);

            this.$el.dialog({
                autoOpen: true,
                title: "Create Subnet",
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
            $("#vpc_select").selectmenu();
            $("#zone_select").selectmenu();

            this.vpcs.on( 'reset', this.addAllVpcs, this );
            this.vpcs.fetch({ data: $.param({ cred_id: this.credentialId, region: this.region }), reset: true });

            this.availabilityZones.on( 'reset', this.addAllAvailabilityZones, this );
            this.availabilityZones.fetch({ data: $.param({ cred_id: this.credentialId, region: this.region }), reset: true });
		},

        addAllVpcs: function() {
            $("#vpc_select").empty();
            this.vpcs.each(function(vpc) {
                $("#vpc_select").append($("<option value=" + vpc.attributes.id + ">" + vpc.attributes.id + "</option>"));
            });
            $("#vpc_select").selectmenu();
        },

        addAllAvailabilityZones: function() {
            $("#zone_select").empty();
            this.availabilityZones.each(function(az) {
                $("#zone_select").append($("<option value=" + az.attributes.zoneName + ">" + az.attributes.zoneName + "</option>"));
            });
            $("#zone_select").selectmenu();
        },
		
		create: function() {
            var subnet = this.subnet;
            var options = {};
            var issue = false;

			//Validate and create
            if($("#vpc_select").val !== null && $("#vpc_select").val() !== "") {
                options.vpc_id = $("#vpc_select").val();
            }else {
                issue = true;
            }

            if($("#zone_select").val() !== null && $("#zone_select").val() !== "") {
                options.availability_zone = $("#zone_select").val();
            }

            if($("#cidr_block_input").val() !== "") {
                options.cidr_block = $("#cidr_block_input").val();
            }else {
                issue = true;
            }

            if(!issue) {
                subnet.create(options, this.credentialId, this.region);
                this.$el.dialog('close');
            }else {
                Common.errorDialog("Invalid Request", "Please supply all required fields.");
            }
		}

	});
    
	return SubnetCreateView;
});
