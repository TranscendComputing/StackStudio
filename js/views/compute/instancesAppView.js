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
        'text!templates/compute/instanceAppTemplate.html',
        'models/compute/instance',
        'collections/compute/instances',
        'views/compute/instanceRowView',
        'views/compute/instanceCreateView',
        'icanhaz',
        'common',
        'jquery.dataTables'
], function( $, _, Backbone, instanceAppTemplate, instance, instances, InstanceRowView, InstanceCreate, ich, Common ) {
    'use strict';

    // Instances Application View
    // ------------------------------

    /**
     * InstancesAppView is UI view list of cloud instances.
     *
     * @name InstancesAppView
     * @constructor
     * @category Resources
     * @param {Object} initialization object.
     * @returns {Object} Returns a ComputeAppView instance.
     */
    var InstancesAppView = Backbone.View.extend({
        /** The ID of the selected compute */
        selectedId: undefined,
        instance: instance,
        instances: instances,
        el: '#resource_app',

        render: function() {
            //If instance id is supplied, select it
            if(this.selectedId) {
                this.selectOne(this.selectedId, $("tr:contains("+this.selectedId+")"));
            }
        },

        // Add a single instance item to the list by creating a view for it.
        addOne: function( instance ) {
            if (instance.get('computeId') === "") {
                // Refuse to add computes until they're initialized.
                return;
            }
            var view = new InstanceRowView({ model: instance });
            view.render();
        },

        // Add all items in the **Instances** collection at once.
        addAll: function() {
            this.instances.each(this.addOne, this);
        },

        createNew : function () {
            var instanceCreate = new InstanceCreate();
            instanceCreate.render();
        },

        selectOne : function (instanceId, parentNode) {
            var selectedModel;
            this.clearSelection();
            console.log("Selecting ID:", instanceId);
            if(parentNode) {
                $(parentNode).addClass('row_selected');
            }
            
            this.instances.each(function(e) {
                if (e.get('instanceId') === instanceId) {
                    selectedModel = e;
                }
            });
            
            if(selectedModel) {
                this.selectedId = instanceId;
                $("#details").html(ich.instance_detail(selectedModel.attributes));
                $("#detail_tabs").tabs();
            }else {
                
            }
        },
        
        clearSelection: function () {
            this.$table.$('tr').removeClass('row_selected');
            $('#details').html("");
        }
    });

    console.log("instance app view defined");
    
    return InstancesAppView;
});
