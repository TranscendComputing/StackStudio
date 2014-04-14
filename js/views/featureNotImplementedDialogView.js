/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
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
        'text!templates/featureNotImplementedTemplate.html',
        'icanhaz',
        'common',
        'jquery.multiselect',
        'jquery.multiselect.filter'
        
], function( $, _, Backbone, DialogView, featureNotImplementedTemplate, ich, Common ) {
            
    /**
     * RouteTableCreateView is UI form to create compute.
     *
     * @name RouteTableCreateView
     * @constructor
     * @category RouteTable
     * @param {Object} initialization object.
     * @returns {Object} Returns a RouteTableCreateView instance.
     */
    
    var FeatureNotImplementedDialogView = DialogView.extend({

        template: _.template(featureNotImplementedTemplate),

        // Delegated events for creating new instances, etc.
        events: {
            "dialogclose": "close"
        },

        initialize: function(options) {
            this.featureUrl = options.feature_url;
            this.element = "#message";
            this.render();
        },

        render: function() {
            var createView = this;
            this.$el.html(this.template);

            this.$el.dialog({
                autoOpen: true,
                title: "Not Available",
                width:500,
                minHeight: 150,
                resizable: false,
                modal: true,
                buttons: {
                    OK: function() {
                        createView.cancel();
                    }
                }
                
            });
            $(this.element).html("<div class='feature_not_implemented ninecol'>" +
                                    "<p>" +
                                    "This feature is not currently implemented in StackStudio."  +
                                    "</p>" +
                                    "<p>StackStudio is open source!</p>" +
                                    "<p>" +
                                        "Feel free to contribute to the StackStudio project on GitHub." +
                                        " Additional information may be found here: <a href=" + this.featureUrl + " target='new'>" + this.featureUrl + "</a>" +
                                    "</p>" +
                                 "</div>");
           
        }
    });
    
    return FeatureNotImplementedDialogView;
});
