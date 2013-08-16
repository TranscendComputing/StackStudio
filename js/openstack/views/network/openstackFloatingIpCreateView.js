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
        'text!templates/openstack/network/openstackFloatingIpCreateTemplate.html',
        '/js/openstack/models/network/openstackFloatingIp.js',
        '/js/openstack/collections/network/openstackFloatingIps.js',
        'jquery.ui.selectmenu',
        'jquery.multiselect',
        'jquery.multiselect.filter'
], function( $, _, Backbone, Common, ich, DialogView, floatingIpCreateTemplate, FloatingIp ) {

    var VolumeCreateView = DialogView.extend({
        
        credentialId: undefined,

        region: undefined,

        template: _.template(floatingIpCreateTemplate),

        model: new FloatingIp(),

        events: {
            "dialogclose": "close"
        },

        initialize: function(options) {
            this.credentialId = options.cred_id;
            this.region = options.region;
            this.render();
        },
        
        render: function() {
            var createView = this;
            this.$el.html(this.template);
            this.$el.dialog({
                autoOpen: true,
                title: "Create FloatingIp",
                width: 500,
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
            $("select").selectmenu();
        },

        create: function() {
            this.model.set({
                name: $("#name_input").val()
            });
            if(!this.model.isValid())
            {
                Common.errorDialog("Validation Error", this.model.validationError);
            }else{
                this.model.create(this.credentialId, this.region); 
                this.$el.dialog('close');
            }
        }

    });
    
    return VolumeCreateView;
});
