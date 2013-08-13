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
