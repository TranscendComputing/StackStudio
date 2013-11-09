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
        'text!templates/aws/cloud_formation/awsStackUpdateTemplate.html',
        '/js/aws/models/cloud_formation/awsStack.js',
        '/js/aws/collections/notification/awsTopics.js',
        '/js/aws/models/notification/awsTopic.js',
        '/js/aws/models/notification/awsSubscription.js',
        'common',
        'jquery.form'
        
], function( $, _, Backbone, DialogView, StackUpdateTemplate, Stack, Topics, Topic, Subscription, Common ) {
    
    var CloudFormationStackUpdateView = DialogView.extend({

        template: _.template(StackUpdateTemplate),

        credentialId: undefined,

        region: undefined,
        stack : undefined,
        currentViewIndex: 0,
        // Delegated events for creating new instances, etc.
        events: {
            "dialogclose": "close",
            "change input[name=templateOption]": "templateOptionChange"
        },

        initialize: function(options) {
            var $this = this;
            this.credentialId = options.cred_id;
            this.region = options.region;
            this.stack = options.stack;
        },
        render: function() {
            var updateView = this;
            this.$el.html(this.template);

            this.$el.dialog({
                autoOpen: true,
                title: "Update Stack",
                width:575,
                minHeight: 500,
                resizable: false,
                modal: true,
                buttons: {
                    Previous: {
                        text: "Previous",
                        id: "previous_button",
                        click: function() {
                            updateView.previous();
                        }
                    },
                    Next: {
                        text: "Next",
                        id: "next_button",
                        click: function() {
                            updateView.next();
                        }
                    }
                }
            });
            this.refreshView(0);
            $("#cf_update_stack_name").val(this.stack.id);
            $("#cf_update_stack_name").attr("disabled", "true");
            $(".template_input").hide();
        },

        templateOptionChange: function(e){
            var templateInput = $(e.currentTarget.parentElement).find("input[name=template]");
            $(".template_input").hide();
            templateInput.show();
        },

        next: function() {
            if(this.currentViewIndex === 2) {
                this.update();
            }else if(this.currentViewIndex ===1){
                this.renderReviewScreen();
                this.currentViewIndex++;
                this.refreshView(this.currentViewIndex);
            }
            else {
                var $this = this;
                var validated = this.validateInputFields(this.currentViewIndex);
                if(validated){
                    if(this.currentViewIndex === 0){
                        Common.vent.once("templateValidated", function(result){
                            Common.vent.off("templateValidationFailed");
                            $this.currentViewIndex++;
                            $this.refreshView($this.currentViewIndex);
                            $this.populateParameters(result.Parameters);
                        });
                        Common.vent.once("templateValidationFailed", function(xhr){
                            Common.vent.off("templateValidated");
                            Common.errorDialog("Template Validation Failed", JSON.parse(xhr.responseText).message);
                        });
                    }else{
                        this.currentViewIndex++;
                        this.refreshView(this.currentViewIndex);
                    }
                }
            }

        },
        update: function(){
            var $this = this;
            var updateParams = this.generateUpdateParams();
            this.stack.update(updateParams, this.credentialId, this.region);
            Common.vent.once("cloudFormationStackUpdated", function(){
                $this.$el.dialog('close');
            });
        },
        previous: function() {
            this.currentViewIndex--;
            this.refreshView(this.currentViewIndex);
        },
        renderReviewScreen: function(){
            var templateField = $("#view0").find("input[type=radio]:checked").parent().find("input[name=template]");

            $("#name_review").html($("#cf_update_stack_name").val());
            $("#description_review").html(templateField.data("TemplateInfo").Description);
            $("#template_review").html(templateField.val().split("C:\\fakepath\\").pop());
            $("#iam_review").html($("#iam_acknowledge").is(":checked") + "");

            var parameters = "";
            var lastNode = $("#parameter_review_title");
            $(".parameter_item").remove();
            $("#parameters_list :input").each(function(index, node){
                var name = node.name.split("Parameter.")[1];
                var value = node.value;
                lastNode = $("<tr></tr>")
                .addClass("parameter_item")
                .append("<td><b>"+name+":</b></td>")
                .append("<td>"+value+"</td>")
                .insertAfter(lastNode);
            });



        },
        generateUpdateParams: function(){
            var templateField = $("#view0").find("input[type=radio]:checked").parent().find("input[name=template]");
            var updateParams= {
                "Parameters": {},
                "Capabilities": []
            };
            if(templateField.attr("type") ==="url"){
                updateParams["TemplateURL"] = templateField.val();
            }else{
                updateParams["TemplateBody"] = JSON.stringify(templateField.data("TemplateBody"));
            }

            $("#parameters_list :input").each(function(index, node){
                var name = node.name.split("Parameter.").pop();
                var value = node.value;
                updateParams["Parameters"][name] = value;
            });

            if($("#iam_acknowledge").is(":checked")){
                updateParams["Capabilities"].push("CAPABILITY_IAM");
            }
            return updateParams;
        },

        refreshView: function (viewIndex) {
            $(".view_stack").hide();
            $("#view"+viewIndex).show();
            this.currentViewIndex = viewIndex;

            if(this.currentViewIndex === 0) {
                $("#previous_button").addClass("ui-state-disabled");
                $("#previous_button").attr("disabled", true);
            }else {
                $("#previous_button").removeClass("ui-state-disabled");
                $("#previous_button").attr("disabled", false);
            }

            if(this.currentViewIndex === 2) {
               // this.renderReviewScreen();
                $("#next_button").text("Update");
            }else {
                $("#next_button").text("Next");
            }
            $("#next_button").button();
        },
        validateInputFields: function(viewIndex){
            switch(viewIndex){
                case 0:
                    var templateField = $("#view0").find("input[type=radio]:checked").parent().find("input[name=template]");
                    if(templateField.length === 0 || !templateField.val() || templateField.val() === ""){
                        this.displayValid(false, templateField);
                    }
                    else{
                        this.displayValid(true, templateField);
                    }
                    this.validateTemplate();
                    return true;
                default:
                    return true;
            }
        },

        validateTemplate: function(){
            var templateField = $("#view0").find("input[type=radio]:checked").parent().find("input[name=template]");
            if(templateField.val() && templateField.val() !==""){
                var type = templateField[0].type;
                var apiUrl = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/cloud_formation/template/validate?cred_id=" + this.credentialId + "&type="+ type;
                if(type==="file"){
                    //$("#template_upload").attr("action", apiUrl);
                    
                    var sendForm = $('<form></form>')
                    .attr("action", apiUrl)
                    .attr("enctype", "multipart/form-data")
                    .attr("method", "POST")
                    .html(templateField)
                    .ajaxForm({
                        dataType: 'json',
                        success: function(response){
                            templateField.data("TemplateBody", response.TemplateBody);
                            templateField.data("TemplateInfo", response.ValidationResult);
                            Common.vent.trigger("templateValidated", response.ValidationResult);
                        },
                        error: function(xhr){
                            Common.vent.trigger("templateValidationFailed", xhr);
                            //Common.errorDialog(xhr.statusText, JSON.parse(xhr.responseText).message);
                        }
                    });
                    sendForm.submit();
                    $("#template_file_span").html(templateField);
                    // $("#template_upload").submit();
                }
                else if(type==="url"){
                    $.ajax({
                        success:function(response){
                            templateField.data("TemplateInfo", response.ValidationResult);
                            Common.vent.trigger("templateValidated", response.ValidationResult);
                        },
                        error:function(xhr){
                            Common.vent.trigger("templateValidationFailed", xhr);
                        },
                        type: "POST",
                        url: apiUrl,
                        data: JSON.stringify({"TemplateURL": templateField.val()})
                    });
                }
            }
            return;
        },
        populateParameters: function(parameters){
            $("#parameters_list").html("");
            for(var i =0; i < parameters.length; i++){
                var key = parameters[i].ParameterKey;
                var defaultValue = parameters[i].DefaultValue ? parameters[i].DefaultValue : "";
                var inputType = parameters[i].NoEcho ? "password" : "text";
                $("#parameters_list").append("<label for='Parameter."+key+"'>"+key+"</label><input type='"+inputType+"' name='Parameter."+key+"' id='Parameter."+key+"' value='"+defaultValue+"'/>");


            }
        },
        displayValid: function(valid, node) {
            var target = "border-color";
            var selector = node;
            if(node[0] && node[0].type === "file"){
                selector = node[0];
                target = "color";
            }
            if(valid) {
                $(selector).css(target, "");
            }else{
                $(selector).css(target, "#FF0000");
            }
        },
        showAdvancedOptions: function(e){
            if($(e.currentTarget).is(":checked")){
                $("#advanced_options").show();
            }else{
                $("#advanced_options").hide();
            }
        },
        notificationsMenuHandler: function(e){
            if($(e.currentTarget).val() === "#update_topic"){
                $("#new_topic_form").show();
            }else{
                $("#new_topic_form").hide();
            }
        }


        
       });
    
    return CloudFormationStackUpdateView;
});
