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
        'text!templates/aws/vpc/awsAssociateDhcpOptionsTemplate.html',
        '/js/aws/models/vpc/awsVpc.js',
        '/js/aws/collections/vpc/awsDhcpOptionsSets.js',
        'common',
        'jquery.ui.selectmenu'
        
], function( $, _, Backbone, DialogView, associateDhcpOptionTemplate, Vpc, DhcpOptions, Common ) {
    
    var AssociateDhcpOptionsView = DialogView.extend({
        
        credentialId: undefined,

        region: undefined,

        template: _.template(associateDhcpOptionTemplate),

        vpc: undefined,

        dhcps: new DhcpOptions(),

        events: {
            "dialogclose": "close"
        },

        initialize: function(options) {
            this.credentialId = options.cred_id;
            this.region = options.region;
            this.vpc = options.vpc;
            var associateView = this;
            this.$el.html(this.template);

            this.$el.dialog({
                autoOpen: true,
                title: "Change DHCP Options Set",
                width:450,
                minHeight: 150,
                resizable: false,
                modal: true,
                buttons: {
                    Associate: function () {
                        associateView.associate();
                    },
                    Cancel: function() {
                        associateView.cancel();
                    }
                }
            });

            $("#dhcp_options_select").selectmenu();

            this.dhcps.on( 'reset', this.addAllDhcpOptions, this );
            this.dhcps.fetch({ data: $.param({ cred_id: this.credentialId, region: this.region }), reset: true });
        },

        render: function() {
            
        },

        addAllDhcpOptions: function() {
            $("#dhcp_options_select").empty();
            $("#dhcp_options_select").append($("<option value='default'>None</option>"));
            this.dhcps.each(function(dhcp) {
                $("#dhcp_options_select").append($("<option value=" + dhcp.attributes.id + ">" + dhcp.attributes.id + "</option>"));
            });
            $("#dhcp_options_select option[value=" + this.vpc.attributes.dhcp_options_id + "]").attr("selected", "selected");
            $("#dhcp_options_select").selectmenu();
        },
        
        associate: function() {
            var associateVpc = this.vpc;
            var options = {};
            var issue = false;
            //Validate and create
            if($("#dhcp_options_select").val() != null && $("#dhcp_options_select").val() !== "") {
                options.id = this.vpc.attributes.id;
                options.dhcp_options_id = $("#dhcp_options_select").val();
            }else {
                issue = true;
            }

            if(!issue) {
                associateVpc.associateDhcpOptions(options, this.credentialId, this.region);
                this.$el.dialog('close');
            }else {
                Common.errorDialog("Invalid Request", "Please supply all required fields.");
            }
        }

    });
    
    return AssociateDhcpOptionsView;
});
