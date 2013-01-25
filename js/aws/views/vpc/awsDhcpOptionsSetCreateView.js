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
        'text!templates/aws/vpc/awsDhcpOptionsSetCreateTemplate.html',
        '/js/aws/models/vpc/awsDhcpOptionsSet.js',
        'icanhaz',
        'common',
        'jquery.ui.selectmenu',
        'jquery.multiselect',
        'jquery.multiselect.filter'
        
], function( $, _, Backbone, dhcpOptionSetCreateTemplate, DhcpOptionsSet, ich, Common ) {
            
    /**
     * DhcpOptionsSetCreateView is UI form to create compute.
     *
     * @name DhcpOptionsSetCreateView
     * @constructor
     * @category DhcpOptionsSet
     * @param {Object} initialization object.
     * @returns {Object} Returns a DhcpOptionsSetCreateView instance.
     */
    
    var DhcpOptionsSetCreateView = Backbone.View.extend({
        
        
        tagName: "div",
        
        template: _.template(dhcpOptionSetCreateTemplate),
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
                title: "Create DHCP Options Set",
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
                       
            return this;
        },
        
        close: function() {
            //$("#region_select").remove();
            this.$el.dialog('close');
        },
        
        cancel: function() {
            this.$el.dialog('close');
        },
        
        create: function() {
            //Validate and create
            this.$el.dialog('close');
        }

    });
    
    return DhcpOptionsSetCreateView;
});
