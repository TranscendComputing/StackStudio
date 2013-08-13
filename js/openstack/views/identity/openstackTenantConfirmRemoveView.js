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
        'text!templates/openstack/identity/openstackTenantConfirmRemoveTemplate.html',
        'jquery.ui.selectmenu',
        'jquery.multiselect',
        'jquery.multiselect.filter'
], function( $, _, Backbone, Common, ich, DialogView, tenantConfirmRemoveTemplate ) {

    var TenantConfirmRemoveView = DialogView.extend({
        template: tenantConfirmRemoveTemplate,

        events: {
            "dialogclose": "close",
            "change input#enabled_input": "toggleEnabled"
        },

        initialize: function(options) {
            this.message = options.message;
            this.render();
        },
        
        render: function() {
            var createView = this;
            ich.addTemplate("tenant_confirm_remove_template", this.template);
            this.$el.html( ich.tenant_confirm_remove_template({message: this.message}) );
            this.$el.dialog({
                autoOpen: true,
                title: "Confirm Remove Users",
                width:500,
                minHeight: 150,
                resizable: false,
                modal: true,
                buttons: {
                    Confirm: function () {
                        createView.confirm();
                    },
                    Cancel: function() {
                        createView.cancel();
                    }
                }
            }); 
        },

        confirm: function() {
            Common.vent.trigger("tenant:confirmRemove");
            this.cancel();
        }

    });
    
    return TenantConfirmRemoveView;
});
