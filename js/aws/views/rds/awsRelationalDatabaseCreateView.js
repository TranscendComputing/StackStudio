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
        'text!templates/aws/rds/awsRelationalDatabaseCreateTemplate.html',
        '/js/aws/models/rds/awsRelationalDatabase.js',
        'common',
        'jquery.ui.selectmenu',
        'jquery.multiselect',
        'jquery.multiselect.filter'
        
], function( $, _, Backbone, DialogView, databaseCreateTemplate, RelationalDatabase,  Common ) {
    
    var RelationalDatabaseCreateView = DialogView.extend({

        credentialId: undefined,

        currentViewIndex: undefined,
 
        events: {
            "dialogclose": "close"
        },

        initialize: function(options) {
            this.credentialId = options.cred_id;
        },

        render: function() {
            var createView = this;
            var compiledTemplate = _.template(databaseCreateTemplate);
            this.$el.html(compiledTemplate);

            this.$el.dialog({
                autoOpen: true,
                title: "Relational Database Wizard",
                width:625,
                minHeight: 150,
                resizable: false,
                modal: true,
                buttons: {
                    Previous: {
                        text: "Previous",
                        id: "previous_button",
                        click: function() {
                            createView.previous();
                        }
                    },
                    Next: {
                        text: "Next",
                        id: "next_button",
                        click: function() {
                            createView.next();
                        }
                    },
                }
            });
            $("select").selectmenu();
            this.refreshView(1);
        },

        next: function() {
            if(this.currentViewIndex === 5) {
                this.create();
            }else {
               this.currentViewIndex++;
                this.refreshView(this.currentViewIndex); 
            }
        },

        previous: function() {
            this.currentViewIndex--;
            this.refreshView(this.currentViewIndex);
        },

        refreshView: function (viewIndex) {
            $(".view_stack").hide();
            $("#view"+viewIndex).show();
            this.currentViewIndex = viewIndex;

            if(this.currentViewIndex === 1) {
                $("#previous_button").addClass("ui-state-disabled");
                $("#previous_button").attr("disabled", true);
            }else {
                $("#previous_button").removeClass("ui-state-disabled");
                $("#previous_button").attr("disabled", false);
            }

            if(this.currentViewIndex === 5) {
                $("#next_button span").text("Create");
            }else {
                $("#next_button span").text("Next");
            }
            $("#next_button").button();
        },

        create: function() {
            alert("Creating!");
        }

    });
    
    return RelationalDatabaseCreateView;
});
