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
        'text!templates/account/cloudServiceCreateTemplate.html',
        'common'
        
], function( $, _, Backbone, DialogView, groupCreateTemplate, Common ) {
    
    var CloudServiceCreateView = DialogView.extend({

        cloud_account: undefined,
        
        events: {
            "dialogclose": "close"
        },

        initialize: function(options) {
            this.cloud_account = options.cloud_account;
            var createView = this;
            var compiledTemplate = _.template(groupCreateTemplate);
            this.$el.html(compiledTemplate);

            this.$el.dialog({
                autoOpen: true,
                title: "Create Cloud Service",
                resizable: false,
                width: 325,
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
        },

        render: function() {
            $("#org_select").selectmenu();
            $("#cloud_select").selectmenu();
        },

        create: function() {
            var options = {};
            options.enabled = true;
            
            var issue = false;

            $('input', '#create_service_form').each(function(){
                if($(this).val() === ""){
                    $(this).css("border-color", "red");
                    issue = true;
                }
                else
                    $(this).css("border-color", "");
            });
            var array = $("#create_service_form").serializeArray();
            for(var i = 0; i < array.length; i++){
                options[array[i].name] = array[i].value;
            }
            
            if(!issue){
                this.cloud_account.addService(options);
                this.$el.dialog('close');
            }else {
                Common.errorDialog("Invalid Request", "Please supply all required fields.");
            }
        }
    });
    
    return CloudServiceCreateView;
});
