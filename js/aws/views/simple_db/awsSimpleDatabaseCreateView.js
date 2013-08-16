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
        'text!templates/aws/simple_db/awsSimpleDBCreateTemplate.html',
        '/js/aws/models/simple_db/awsSimpleDatabase.js',
        'common'
        
], function( $, _, Backbone, DialogView, simpleDBCreateTemplate, SimpleDB, Common ) {
    
    var SimpleDBCreateView = DialogView.extend({

        template: _.template(simpleDBCreateTemplate),

        credentialId: undefined,

        region: undefined,
        
        simpleDB: new SimpleDB(),

        events: {
            "dialogclose": "close"
        },

        initialize: function(options) {
            this.credentialId = options.cred_id;
            this.region = options.region;
        },

        render: function() {
            var createView = this;
            this.$el.html(this.template);

            this.$el.dialog({
                autoOpen: true,
                title: "Create Domain",
                width:350,
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
        },

        displayValid: function(valid, selector) {
            if(valid) {
                $(selector).css("border-color", "");
            }else{
                $(selector).css("border-color", "#FF0000");
            }
        },
        
        create: function() {
            var createView = this;
            var newSimpleDB = this.simpleDB;
            var options = {};
            if($("#domain_name_input").val() !== "") {
                this.displayValid(true, "#domain_name_input");
                options["DomainName"] = $("#domain_name_input").val();
                newSimpleDB.create(options, this.credentialId, this.region);
                this.$el.dialog('close');
            }else {
                this.displayValid(false, "#domain_name_input");
            }
        }
    });
    
    return SimpleDBCreateView;
});
