/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true requirejs:true require:true*/
define([
        'jquery',
        'underscore',
        'backbone',
        'common',
        'icanhaz',
        'jquery-plugins',
        'jquery-ui-plugins',
        'jquery.form'
], function( $, _, Backbone, Common, ich ) {

    var CloudCredentialFormView = Backbone.View.extend({
        /** @type {String} DOM element to attach view to */
        el: "#form_area",
        /** @type {Object} Object of events for view to listen on */
        events: {
            "change input": "contentChanged",
            "change textarea": "contentChanged"
            //"submit form[name=submit]":"uploadFile"
        },
        /** Constructor method for current view */
        initialize: function() {
            this.render();
        },
        /** Add all of my own html elements */
        render: function () {
            /**
             * [ich.grabTemplates() description]
             *
             * Looks for any <script type="text/html"> tags to make templates out of.
             * Then removes those elements from the dom (this is the method that runs
             * on document ready when ich first inits).
             */
            this.cloudProvider = this.model.attributes.cloud_provider.toLocaleLowerCase();
            
            if(!ich[this.cloudProvider + "_credential_form"]){
                ich.grabTemplates();
            }
            
            var template = this.cloudProvider + "_credential_form";
            var attributes = (this.model === undefined) ? {} : this.model.attributes;
            
            var form =  ich[template](attributes);
            //Render my template
            this.$el.append(form);
            this.$(".required").after("<span class='required'/>");
            
            $("#p12_upload").attr("action", Common.apiUrl + "/identity/v1/accounts/"+ sessionStorage.account_id + "/" + this.model.attributes.id + "/upload_key_pairs");
            
            if(this.model.attributes.cloud_attributes.google_p12_key !== undefined){
                $("#p12_is_uploaded").html("Uploaded");
            }else{
                $("#p12_is_uploaded").html("Not Uploaded");
            }
            
            $('#p12_upload').ajaxForm({
                complete: function() {
                    $("#p12_is_uploaded").html("Uploaded");
                }
            });
            
        },

        contentChanged: function(event) {
            var form = $("form")[0];
            var view = this;
            $.each(view.$("input"), function() {
                if(view.model.attributes[this.id] === undefined)
                {
                    view.model.attributes.cloud_attributes[view.cloudProvider + "_" + this.id] = this.value;
                }else{
                    view.model.attributes[this.id] = this.value;
                }
            }, view);
            $.each(view.$("textarea"), function() {
                if(view.model.attributes[this.id] === undefined)
                {
                    view.model.attributes.cloud_attributes[view.cloudProvider + "_" + this.id] = this.value;
                }else{
                    view.model.attributes[this.id] = this.value;
                }
            }, view);
            if(this.formIsComplete(form))
            {
                Common.vent.trigger("form:completed");
            }
        },

        formIsComplete: function(form) {
            var complete = true;
            $.each(form, function(index, value){
                if(value.tagName === "INPUT" || value.tagName === "TEXTAREA")
                {
                    if ($(value).hasClass("required") && value.value === "")
                    {
                        complete = false;
                        return;
                    }
                }
            });
            return complete;
        },
        
        uploadFile: function(e){
            var upUrl = Common.apiUrl + "/identity/v1/accounts/"+ sessionStorage.account_id + "/" + this.model.attributes.id + "/upload_key_pairs?_method=POST";
            
            e.preventDefault();

            $.ajax({
                url: upUrl,
                data: $("#p12_upload").serialize(),
                contentType: 'application/x-www-form-urlencoded',
                success: function(data){
                    //file uploaded
                },
                error: function(jqXHR) {
                    Common.errorDialog(jqXHR.statusText, jqXHR.responseText);
                }
            });
        },
        
        close: function(){
            this.$el.empty();
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
        }
    });

    return CloudCredentialFormView;
});
