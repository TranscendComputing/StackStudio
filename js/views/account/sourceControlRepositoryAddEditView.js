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
        'text!templates/account/sourceControlRepositoryAddEditTemplate.html',
        '/js/models/sourceControlRepository.js',
        'common'
        
], function( $, _, Backbone, DialogView, scRepoAddEditTemplate, SCRepo, Common ) {
    
    var SCRepositoryAddEditView = DialogView.extend({

        template: undefined,
        repository: undefined,
        
        events: {
            "dialogclose": "close"
        },

        initialize: function(options) {
            var createView = this;
            this.template = _.template(scRepoAddEditTemplate);
            this.$el.html(this.template);

            var title = "Add Source Control Repository";
            if(options && options.repository) {
                title = "Edit Source Control Repository";
                this.repository = options.repository;
            }

            this.$el.dialog({
                autoOpen: true,
                title: title,
                resizable: false,
                width: 400,
                modal: true,
                buttons: {
                    Save: function () {
                        createView.save();
                    },
                    Cancel: function() {
                        createView.cancel();
                    }
                }
            });
            this.render();
        },

        render: function() {
            if(this.repository) {
                $.each(this.repository.attributes, function (key, value) {
                    $("#source_control_repo_"+key.toString()).val(value);
                });
            }
        },

        displayValid: function(valid, selector) {
            if(valid) {
                $(selector).css("border-color", "");
            }else{
                $(selector).css("border-color", "#FF0000");
            }
        },

        save: function() {
            var addEditView = this;
            var options = {};
            var issue = false;

            //Get All inputs
            var scmInputs = $("#source_control_repo_add_edit input,textarea,select");
            $.each(scmInputs, function(index, value) {
                var jQuerySelector = "#" + value.id;
                //If input title is not optional, check it is not blank
                if(value.title !== "optional") {
                    if($(jQuerySelector).val().trim() === "") {
                        addEditView.displayValid(false, jQuerySelector);
                        issue = true;
                    }else {
                        addEditView.displayValid(true, jQuerySelector);
                        options[value.name] = $(jQuerySelector).val();
                    }
                }
            });
            options["org_id"] = sessionStorage.org_id;
            
            if(!issue) {
               if(this.repository) {
                    this.repository.update(options);
                }else {
                    this.repository = new SCRepo();
                    this.repository.create(options);
                }
                this.close();
            }else {
                Common.errorDialog("Invalid Request", "Please supply all required fields.");
            }
        }

    });
    
    return SCRepositoryAddEditView;
});
