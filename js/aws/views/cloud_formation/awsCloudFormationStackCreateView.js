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
        'text!templates/aws/cloud_formation/awsStackCreateTemplate.html',
        '/js/aws/models/cloud_formation/awsStack.js',
        '/js/aws/collections/notification/awsTopics.js',
        '/js/aws/models/notification/awsTopic.js',
        '/js/aws/models/notification/awsSubscription.js',
        'common',
        'jquery.form'
        
], function( $, _, Backbone, DialogView, StackCreateTemplate, Stack, Topics, Topic, Subscription, Common ) {
    
    var CloudFormationStackCreateView = DialogView.extend({

        template: _.template(StackCreateTemplate),

        credentialId: undefined,

        region: undefined,
        stack : undefined,
        currentViewIndex: 0,
        // Delegated events for creating new instances, etc.
        events: {
            "dialogclose": "close",
            "change input[name=templateOption]": "templateOptionChange",
            "click #add_tag": "addTagHandler",
            "click .remove_tag": "removeTagHandler",
            "change #options_checkbox":"showAdvancedOptions",
            "change #notifications_select":"notificationsMenuHandler"
        },

        addTagHandler: function(e){
            e.preventDefault();
            this.tagsTable.fnAddData({});
            var length = this.tagsTable.fnGetNodes().length;
            if(length === 10){
                $("#add_tag_span").hide();
            }
            return false;
        },
        removeTagHandler: function(e){
            e.preventDefault();
            var rowIndex = this.tagsTable.fnGetPosition($(e.currentTarget.parentElement).closest("tr")[0]);
            this.tagsTable.fnDeleteRow(rowIndex);
            $("#add_tag_span").show();

            return false;
        },
        initialize: function(options) {
            var $this = this;
            this.credentialId = options.cred_id;
            this.region = options.region;
            this.stack = new Stack();
            this.topics = new Topics();
            this.fetchTopics();
            Common.vent.on("reloadTopics", this.fetchTopics);


        },
        render: function() {
            var createView = this;
            this.$el.html(this.template);

            this.$el.dialog({
                autoOpen: true,
                title: "Create Stack",
                width:575,
                minHeight: 500,
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
                    }
                }
            });
            this.tagsTable = $("#view2 table").dataTable({
                "bJQueryUI": true,
                "bPaginate": false,
                "bSort": false,
                "sDom": 't',
                "aoColumns": [{"sTitle": "Key",mData: function(){
                        return "<input type='text'/>";
                    }},
                    {"sTitle": "Value", mData: function(){
                        return "<input type='text'/>";
                    }},
                    {"sTitle": "Remove",  mData: function(){
                        return "<span><a href='#' class='remove_tag'>X</span>";
                    }}
                ],
                "oLanguage": {
                    "sEmptyTable": "",
                    "sZeroRecords": ""
                }
            });
            this.tagsTable.fnAddData({});
            this.refreshView(0);
            $(".template_input").hide();
        },

        fetchTopics: function(){
            var $this=this;
            this.topics.fetch(
                {
                    data: $.param({ cred_id: this.credentialId, region: this.region }),
                    success:function(collection){
                        var menu = $("#notifications_select");
                        menu.html("");
                        menu.append("<option value=''>(no notification)</option>");
                        menu.append("<option value='#create_topic'>Create a new SNS topic</option>");
                        collection.each(function(model){
                            var option = $("<option></option>")
                            .attr("value", model.id)
                            .html(model.get("Name"));
                            if($this.selectedTopic === model.id){
                                option.attr("selected", "selected");
                            }
                            menu.append("<option value='"+model.id +"'>"+ model.get("Name")+"</option>");
                        });
                    },
                    error:function(xhr){
                        Common.errorDialog("Topic Retrieval Failure", "Could not retrieve SNS topics");
                    }
                });
        },

        templateOptionChange: function(e){
            var templateInput = $(e.currentTarget.parentElement).find("input[name=template]");
            $(".template_input").hide();
            templateInput.show();
        },

        next: function() {
            if(this.currentViewIndex === 3) {
                this.create();
            }else if(this.currentViewIndex ===2){
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
                            $this.topicHandler(result);
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
        create: function(){
            var $this = this;
            var creationParams = this.generateCreationParams();
            this.stack.create(creationParams, this.credentialId, this.region);
            Common.vent.once("cloudFormationStackCreated", function(){
                $this.$el.dialog('close');
            });
        },
        topicHandler: function(validateTemplateResult){
            var $this = this;
            var nextPage = function(){
                $this.currentViewIndex++;
                $this.refreshView($this.currentViewIndex);
                $this.populateParameters(validateTemplateResult.Parameters);
            };

            if($("#notifications_select").val() !=="#create_topic"){
                nextPage();
            }else{
                var newTopic = new Topic();
                var newSubscription = new Subscription();

                var snsName = $("#new_sns_name").val();
                var snsEmail = $("#new_sns_email").val();

                var options = {"name": $("#new_sns_name").val()};
                newTopic.create(options, this.credentialId, this.region, "topicCreated");
                Common.vent.once("topicCreated", function(response){
                    var topicId = response.data.body.TopicArn;
                    var topicName = topicId.split(":").pop();
                    $("#notifications_select").append("<option value='"+ topicId +"'>"+ topicName+"</option>");
                    $("#notifications_select").val(topicId);

                    $("#new_topic_form").find(":input").val("");
                    $("#new_topic_form").hide();

                    options = {"endpoint": snsEmail, "protocol":"email"};
                    newSubscription.create(response.data.body.TopicArn, options, $this.credentialId, $this.region, "subscriptionCreated");
                    Common.vent.once("subscriptionCreated",function(){
                        nextPage();
                    });
                });
            }
        },
        previous: function() {
            this.currentViewIndex--;
            this.refreshView(this.currentViewIndex);
        },
        renderReviewScreen: function(){
            var templateField = $("#view0").find("input[type=radio]:checked").parent().find("input[name=template]");

            $("#name_review").html($("#cf_create_stack_name").val());
            $("#description_review").html(templateField.data("TemplateInfo").Description);
            $("#template_review").html(templateField.val().split("C:\\fakepath\\").pop());

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
        generateCreationParams: function(){
            var templateField = $("#view0").find("input[type=radio]:checked").parent().find("input[name=template]");
            var creationParams= {
                "StackName": $("#cf_create_stack_name").val(),
                "Parameters": {},
                "Tags" : {},
                "Capabilities": [],
                "NotificationARNs": []
            };
            if(templateField.attr("type") ==="url"){
                creationParams["TemplateURL"] = templateField.val();
            }else{
                creationParams["TemplateBody"] = JSON.stringify(templateField.data("TemplateBody"));
            }

            if($("#notifications_select").val() !== ""){
                creationParams["NotificationARNs"].push($("#notifications_select").val());
            }
            if(parseInt($("#creation_timeout_select").val(), 10) !== 0){
                creationParams["TimeoutInMinutes"] = parseInt($("#creation_timeout_select").val(), 10);
            }

            creationParams["DisableRollback"] = $("#view0").find(":input[name=rollback]:checked").val() === "true" ? true : false;

            $("#parameters_list :input").each(function(index, node){
                var name = node.name.split("Parameter.").pop();
                var value = node.value;
                creationParams["Parameters"][name] = value;
            });

            if($("#iam_acknowledge").is(":checked")){
                creationParams["Capabilities"].push("CAPABILITY_IAM");
            }

            $("#stack_tags_table tbody tr").each(function(index, node){
                var name = $(node).find(":input").first().val();
                var value = $(node).find(":input").last().val();
                if(!(name === "" && value==="")){
                    creationParams["Tags"][name] = value;
                }
            });
            return creationParams;
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

            if(this.currentViewIndex === 3) {
               // this.renderReviewScreen();
                $("#next_button").text("Create");
            }else {
                $("#next_button").text("Next");
            }
            $("#next_button").button();
        },
        validateInputFields: function(viewIndex){
            switch(viewIndex){
                case 0:
                    var allValid = false;

                    var validField = $("#cf_create_stack_name").val().trim() !== "";
                    this.displayValid(validField, "#cf_create_stack_name");
                    allValid = validField;

                    var templateField = $("#view0").find("input[type=radio]:checked").parent().find("input[name=template]");
                    if(templateField.length === 0 || !templateField.val() || templateField.val() === ""){
                        allValid = false;
                        this.displayValid(false, templateField);
                    }
                    else{
                        this.displayValid(true, templateField);
                    }
                    if($("#notifications_select").val() ==="#create_topic"){
                        validField = $("#new_sns_name").val().trim() !== "";
                        allValid = allValid && validField;
                        this.displayValid(validField, "#new_sns_name");


                        validField = $("#new_sns_email").val().trim() !== "";
                        allValid = allValid && validField;
                        this.displayValid(validField, "#new_sns_email");
                    }
                    if(allValid){
                        this.validateTemplate();
                    }
                    return allValid;
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
            if($(e.currentTarget).val() === "#create_topic"){
                $("#new_topic_form").show();
            }else{
                $("#new_topic_form").hide();
            }
        }


        
       });
    
    return CloudFormationStackCreateView;
});
