/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true requirejs:true require:true alert:true*/
define([
        'jquery',
        'underscore',
        'bootstrap',
        'backbone',
        'common',
        'text!templates/images/imagesTemplate.html',
        'text!templates/images/advancedTemplate.html',
        'models/packedImage',
        'jquery-ui'
], function( $, _, bootstrap, Backbone, Common, imagesTemplate, advancedTemplate, PackedImage ) {

    var ImagesView = Backbone.View.extend({

        tagName: 'div',

        template: _.template(imagesTemplate),

        currentImageTemplate: undefined,

        events: {
            "click #new_image_template_button": "newImageTemplate",
            "click #close_image_template_button": "closeImageTemplate",
            "change #image_type_select":"builderSelect",
            "change #image_config_management_select":"provisionerSelect",
            "click .adv_tab": "advTabSelect",
            "click #save_image_template_button":"packImage"
        },

        initialize: function() {
            $("#main").html(this.el);
            this.$el.html(this.template);
        },

        render: function() {
            this.fetchDropDowns();
            //Fetch image templates
            if(this.currentImageTemplate) {
                if(this.currentImageTemplate.id === "") {
                    // Set image template fields to defaults
                }else {
                    // Fill in the image template fields to match the selected image template
                }
                $("#image_template_not_opened").hide();
                $("#image_template_open").show();
            }else {
                $("#image_template_open").hide();
                $("#image_template_not_opened").show();
            }
        },

        newImageTemplate: function() {
            if(this.currentImageTemplate) {
                var confirmation = confirm("Are you sure you want to open a new image template? Any unsaved changes to the current template will be lose.");
                if(confirmation === true) {
                    this.currentImageTemplate = "test";
                    this.render();
                }
            }else {
                this.currentImageTemplate = "test";
                this.render();
            }
        },
        
        fetchDropDowns: function(){
            $.getJSON( Common.apiUrl + "/stackstudio/v1/packed_images/builders", function( builders ) {
                $("#image_type_select").empty();
                for (var key in builders) {
                    $("#image_type_select").append("<option>"+key+"</option>");
                }
                $.getJSON( Common.apiUrl + "/stackstudio/v1/packed_images/builders/" + $("#image_type_select").val(), function( builder ) {
                    $("#builder_settings").html(_.template(advancedTemplate)({optional: builder.optional, required: builder.required, title: "Builder: "+$("#image_type_select").val()}));
                    $("#builder_settings").tooltip();
                });
            });
            $.getJSON( Common.apiUrl + "/stackstudio/v1/packed_images/provisioners", function( provisioners ) {
                $("#image_config_management_select").empty();
                for (var key in provisioners) {
                    $("#image_config_management_select").append("<option>"+key+"</option>");
                }
                $.getJSON( Common.apiUrl + "/stackstudio/v1/packed_images/provisioners/" + $("#image_config_management_select").val(), function( provisioner ) {
                    if(provisioner.shell !== undefined){
                        provisioner.optional = provisioner.shell.optional;
                        provisioner.required = provisioner.shell.required_xor;
                    }
                    $("#provisioner_settings").html(_.template(advancedTemplate)({optional: provisioner.optional, required: provisioner.required, title: "Provisioner: "+$("#image_config_management_select").val()}));
                    $("#provisioner_settings").tooltip();
                });
            });
        },
        
        builderSelect: function(){
            $.getJSON( Common.apiUrl + "/stackstudio/v1/packed_images/builders/" + $("#image_type_select").val(), function( builder ) {
                $("#builder_settings").html(_.template(advancedTemplate)({optional: builder.optional, required: builder.required, title: "Builder: "+$("#image_type_select").val()})).hide().fadeIn('slow');
                $("#builder_settings").tooltip();
            });
        },
        
        provisionerSelect: function(event){
            $.getJSON( Common.apiUrl + "/stackstudio/v1/packed_images/provisioners/" + $("#image_config_management_select").val(), function( provisioner ) {
                if(provisioner.shell !== undefined){
                    provisioner.optional = provisioner.shell.optional;
                    provisioner.required = provisioner.shell.required_xor;
                }
                $("#provisioner_settings").html(_.template(advancedTemplate)({optional: provisioner.optional, required: provisioner.required, title: "Provisioner: "+$("#image_config_management_select").val()})).hide().fadeIn('slow');
                $("#provisioner_settings").tooltip();
            });
        },
        
        advTabSelect: function(event){
            $(".active").removeClass('active');
            $("#"+event.target.id).closest('li').addClass('active');
            $(".adv_tab_panel").hide('slow');
            if(event.target.text === "Builder"){
                $("#builder_settings").show('slow');
            }else if(event.target.text === "Provisioner"){
                $("#provisioner_settings").show('slow');
            }
        },
        
        packImage: function(){
            var builder = {};
            $("#builder_settings :input").each(function() {
                if($( this ).val().length == 0){
                    //dont add
                }else if($(this).attr('type') === 'checkbox'){
                    builder[$(this).attr('name')] = $( this ).is(':checked');
                }else if($(this).attr('type') === 'number' && isNaN($( this ).val())){
                    builder[$(this).attr('name')] = parseInt($( this ).val());
                }else if($(this).attr('data-type').indexOf("array") !== -1){
                    builder[$(this).attr('name')] = [$( this ).val()];
                }else{
                    builder[$(this).attr('name')] = $( this ).val();
                }
            });
            var provisioner = {};
            $("#provisioner_settings :input").each(function() {
                if($( this ).val().length == 0){
                    //dont add
                }else if($(this).attr('type') === 'checkbox'){
                    provisioner[$(this).attr('name')] = $( this ).is(':checked');
                }else if($(this).attr('type') === 'number' && isNaN($( this ).val())){
                    provisioner[$(this).attr('name')] = parseInt($( this ).val());
                }else if($(this).attr('data-type').indexOf("array") !== -1){
                    provisioner[$(this).attr('name')] = [$( this ).val()];
                }else{
                    provisioner[$(this).attr('name')] = $( this ).val();
                }
            });
            this.currentImageTemplate = new PackedImage({"builders":[builder],"provisioners":[provisioner]});
            this.currentImageTemplate.save();
            console.log(this.currentImageTemplate);
        },

        closeImageTemplate: function() {
            this.currentImageTemplate = undefined;
            this.render();
        },

        close: function(){
            this.$el.empty();
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
        }
    });

    var imagesView;

    Common.router.on('route:images', function () {
        if(sessionStorage.account_id) {
            if (this.previousView !== imagesView) {
                this.unloadPreviousState();
                imagesView = new ImagesView();
                this.setPreviousState(imagesView);
            }
            imagesView.render();
        }else {
            Common.router.navigate("", {trigger: true});
            Common.errorDialog("Login Error", "You must login.");
        }
    }, Common);

	return ImagesView;
});
