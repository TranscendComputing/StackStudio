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
        'text!templates/aws/vpc/awsNetworkAclCreateTemplate.html',
        '/js/aws/models/vpc/awsNetworkAcl.js',
        'icanhaz',
        'common',
        'jquery.ui.selectmenu',
        'jquery.multiselect',
        'jquery.multiselect.filter'
        
], function( $, _, Backbone, DialogView, networkAclCreateTemplate, NetworkAcl, ich, Common ) {
			
    /**
     * NetworkAclCreateView is UI form to create compute.
     *
     * @name NetworkAclCreateView
     * @constructor
     * @category NetworkAcl
     * @param {Object} initialization object.
     * @returns {Object} Returns a NetworkAclCreateView instance.
     */
	
	var NetworkAclCreateView = DialogView.extend({
		
		template: _.template(networkAclCreateTemplate),
		// Delegated events for creating new instances, etc.
		events: {
			"dialogclose": "close"
		},

		initialize: function() {
			//TODO
		},

		render: function() {
			var createView = this;
            this.$el.html(this.template);

            this.$el.dialog({
                autoOpen: true,
                title: "Create Network ACL",
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
           
            return this;
		},
		
		create: function() {
			//Validate and create
			this.$el.dialog('close');
		}

	});
    
	return NetworkAclCreateView;
});
