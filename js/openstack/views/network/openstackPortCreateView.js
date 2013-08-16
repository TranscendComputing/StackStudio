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
        'common',
        'icanhaz',
        'views/dialogView',
        'text!templates/openstack/network/openstackPortCreateTemplate.html',
        '/js/openstack/models/network/openstackPort.js',
        '/js/openstack/collections/network/openstackNetworks.js',
        'jquery.ui.selectmenu',
        'jquery.multiselect',
        'jquery.multiselect.filter',
        'backbone.stickit'
], function( $, _, Backbone, Common, ich, DialogView, portCreateTemplate, Port, Networks ) {

    var PortCreateView = DialogView.extend({
        credentialId: undefined,
        region: undefined,
        template: _.template(portCreateTemplate),
        model: new Port(),

        events: {
            "dialogclose": "close"
        },

        initialize: function(options) {
            this.credentialId = options.cred_id;
            this.region = options.region;
            this.networks = new Networks();
            this.networks.on("reset", this.addAllNetworks, this);
            this.networks.fetch({ data: $.param({ cred_id: this.credentialId, region: this.region}), reset: true });
            this.render();
        },
        
        render: function() {
            var createView = this;
            this.$el.html(this.template);
            this.$el.dialog({
                autoOpen: true,
                title: "Create Port",
                width: 450,
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
            $("#network_select").selectmenu();
        },

        addAllNetworks: function() {
            $("#network_select").empty();
            this.networks.each(function(network) {
                $("#network_select").append($("<option value="+network.attributes.id+">"+network.attributes.name+"</option>"));
            });
            $("#network_select").selectmenu();
        },

        create: function() {
            var newPort = this.model;
            var options = {};
            var issue = false;

            options.network_id = $("#network_select").val();
            if($("#name_input").val() !== "") {
                options.name = $("#name_input").val();
            }
            if($("#admin_state_up_checkbox").is(":checked")) {
                options.admin_state_up = true;
            }else {
                options.admin_state_up = false;
            }

            if(!issue) {
                this.model.create(options, this.credentialId, this.region); 
                this.$el.dialog('close');
            }
        }

    });
    
    return PortCreateView;
});
