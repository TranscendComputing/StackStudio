/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true */
define([
        'jquery',
        'backbone'

], function($, Backbone) {

    var FeatureNotImplementedView  = Backbone.View.extend({

        featureUrl: undefined,

        element: undefined,

        initialize: function(options) {
            this.featureUrl = options.feature_url;
            this.element = options.element;
        },

        render: function() {
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
    return FeatureNotImplementedView;
});
