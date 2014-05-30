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
        'text!templates/openstack/network/openstackRouterDestroyTemplate.html',
        'openstack/models/network/openstackRouter',
        'jquery.multiselect',
        'jquery.multiselect.filter',
        'backbone.stickit'
], function( $, _, Backbone, Common, ich, DialogView, routerDestroyTemplate, Router ) {

    var RouterDestroyView = DialogView.extend({
        credentialId: undefined,
        region: undefined,
        template: _.template(routerDestroyTemplate),
        model: undefined,

        events: {
            "dialogclose": "close"
        },

        initialize: function(options) {
            this.credentialId = options.cred_id;
            this.region = options.region;
            this.model = options.router;
            this.render();
        },
        
        render: function() {
            var createView = this;
            this.$el.html(this.template);
            this.$el.dialog({
                autoOpen: true,
                title: "Warning",
                width: 450,
                minHeight: 150,
                resizable: false,
                modal: true,
                buttons: {
                    Continue: function () {
                        createView.destroyRouter();
                    },
                    Cancel: function() {
                        createView.cancel();
                    }
                }
            });
        },

        destroyRouter: function() {
            var issue = false;
            if(!issue) {
                this.model.destroy(this.credentialId); 
                this.$el.dialog('close');
            }
        }

    });
    
    return RouterDestroyView;
});
