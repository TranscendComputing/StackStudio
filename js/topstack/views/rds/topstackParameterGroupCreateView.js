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
        'text!templates/topstack/rds/topstackParameterGroupCreateTemplate.html',
        '/js/topstack/models/rds/topstackDBParameterGroup.js',
        'icanhaz',
        'common'
        
], function( $, _, Backbone, DialogView, parameterGroupCreateTemplate, ParameterGroup, ich, Common ) {
    
    var TopStackParameterGroupCreateView = DialogView.extend({

        credentialId: undefined,

        region: undefined,
        
        parameterGroup: new ParameterGroup(),
        
        events: {
            "dialogclose": "close"
        },

        render: function() {
            var createView = this;
            var compiledTemplate = _.template(parameterGroupCreateTemplate);
            this.$el.html(compiledTemplate);

            this.$el.dialog({
                autoOpen: true,
                title: "Create Parameter Group",
                resizable: false,
                width: 425,
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
            $("#family_select").selectmenu();
        },

        create: function() {
            var newParameterGroup = this.parameterGroup;
            var options = {};
            var issue = false;
            
            if($("#pg_name").val() !== "" && $("#pg_desc").val() !== "" ) {
                options.id = $("#pg_name").val();
                options.description = $("#pg_desc").val();
                options.family = $("#family_select").val();
            }else {
                issue = true;
            }

            if(!issue) {
                newParameterGroup.create(options, this.credentialId, this.region);
                this.$el.dialog('close');
            } else {
                Common.errorDialog("Invalid Request", "Please supply all required fields.");
            }
        }
    });
    
    return TopStackParameterGroupCreateView;
});
