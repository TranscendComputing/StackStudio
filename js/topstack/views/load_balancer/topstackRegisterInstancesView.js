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
/*global define:true console:true alert:true*/
define([
        'jquery',
        'underscore',
        'backbone',
        'views/dialogView',
        'text!templates/topstack/load_balancer/topstackRegisterInstancesTemplate.html',
        'common'
        
], function( $, _, Backbone, DialogView, registerInstancesTemplate, Common ) {
    
    var RegisterInstancesView = DialogView.extend({

        template: _.template(registerInstancesTemplate),

        credentialId: undefined,

        region: undefined,

        loadBalancer: undefined,

        instances: undefined,

        selectedInstance: undefined,

        zonesDistribution: undefined,
        
        events: {
            "dialogclose": "close",
            "click #register_instance_table tr" : "selectInstance"
        },

        render: function() {
            var registerView = this;
            this.$el.html(this.template);

            this.$el.dialog({
                autoOpen: true,
                title: "Register Instance",
                resizable: false,
                width: 800,
                modal: true,
                buttons: {
                    Register: function () {
                        registerView.register();
                    },
                    Cancel: function() {
                        registerView.cancel();
                    }
                }
            });

            this.zonesDistribution = {};

            $('#register_instance_table').dataTable({
                "bJQueryUI": true
            });
            var InstancesType = this.instancesType;
            this.instances = new InstancesType();
            this.instances.on( 'reset', this.addAllInstances, this );
            this.instances.fetch({ data: $.param({ cred_id: this.credentialId, region: this.region }), reset: true});
        },
        
        addAllInstances: function() {
            var registerView = this;
            this.instances.each(function(instance) {
                var alreadyRegistered = false;
                $.each(registerView.loadBalancer.attributes.instances, function(index, value) {
                    if(value === instance.attributes.id) {
                        alreadyRegistered = true;
                    }
                });
                if(alreadyRegistered) {
                    
                }else {
                    var rowData = [instance.attributes.id, instance.attributes.name, instance.attributes.state];
                    $('#register_instance_table').dataTable().fnAddData(rowData);
                }
            });
        },

        selectInstance: function(event) {
            $("#register_instance_table tr").removeClass("row_selected");
            $(event.currentTarget).addClass("row_selected");
            var rowData = $("#register_instance_table").dataTable().fnGetData(event.currentTarget);
            this.selectedInstance = this.instances.get(rowData[0]);
        },

        register: function() {
            if(this.selectedInstance) {
                this.loadBalancer.registerInstances([this.selectedInstance.attributes.id], this.credentialId, this.region);
                this.$el.dialog('close');
            }else {
                Common.errorDialog("Invalid Request", "Please select an instance to register to the load balancer.");
            }
        }
    });
    
    return RegisterInstancesView;
});
