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
        '/js/aws/collections/compute/awsImages.js',
        'collections/packedImages',
        'jquery-ui'
], function( $, _, bootstrap, Backbone, Common, imagesTemplate, advancedTemplate, PackedImage, Images, PackedImages ) {

    var ImagesView = Backbone.View.extend({

        tagName: 'div',

        template: _.template(imagesTemplate),

        currentImageTemplate: undefined,
        
        images: undefined,
        
        packed_images: undefined,

        events: {
            "click #new_image_template_button": "newImageTemplate",
            "click #close_image_template_button": "closeImageTemplate",
            "change #image_type_select":"builderSelect",
            "change #image_config_management_select":"provisionerSelect",
            "click .adv_tab": "advTabSelect",
            "click #save_image_template_button":"packImage",
            "focus #os_input": "openImageList"
        },

        initialize: function() {
            $("#main").html(this.el);
            this.$el.html(this.template);
            
            var creds = JSON.parse(sessionStorage.cloud_credentials);
            $("#aws_cred_select").empty();
            for (var i in creds) {
                if(creds[i].cloud_credential.cloud_provider === "AWS"){
                    $("#aws_cred_select").append("<option value='"+creds[i].cloud_credential.id+"' data-ak='"+creds[i].cloud_credential.access_key+"' data-sk='"+creds[i].cloud_credential.secret_key+"'>"+creds[i].cloud_credential.name+"</option>");
                }
            }
            
            this.packed_images = new PackedImages();
            this.packed_images.on( 'reset', this.addAllPackedImages, this );
            
            this.images = new Images();
            this.images.on( 'reset', this.addAllImages, this );
        },

        render: function() {
            this.fetchDropDowns();
            this.images.fetch({reset: true});
            this.packed_images.fetch({reset: true});
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
                $.getJSON( Common.apiUrl + "/stackstudio/v1/packed_images/builders/" + $("#image_type_select").val().replace('-',''), function( builder ) {
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
        
        addAllImages: function() {
            var createView = this;
            $("#os_input").autocomplete({
                source: createView.images.toJSON(),
                minLength: 0
            })
            .data("autocomplete")._renderItem = function (ul, item){
                var imagePath;
                switch(item.logo)
                {
                case "aws":
                    imagePath = "/images/ImageLogos/amazon20.png";
                    break;
                case "redhat":
                    imagePath = "/images/ImageLogos/redhat20.png";
                    break;
                case "suse":
                    imagePath = "/images/ImageLogos/suse20.png";
                    break;
                case "ubuntu":
                    imagePath = "/images/ImageLogos/canonical20.gif";
                    break;
                case "windows":
                    imagePath = "/images/ImageLogos/windows20.png";
                    break;
                }
                var img = '<td style="width:22px;" rowspan="2"><img height="20" width="20" src="'+imagePath+'"/></td>';
                var name = '<td>'+item.label+'</td>';
                var description = '<td>'+item.description+'</td>';
                var imageItem = '<a><table stlye="min-width:150px;"><tr>'+ img + name + '</tr><tr>' + description + '</tr></table></a>';
                return $("<li>").data("item.autocomplete", item).append(imageItem).appendTo(ul);
            };
        },
        
        addAllPackedImages: function(collection){
            collection.each(function(model) {
                //model.attributes.name;
            });
        },
        
        openImageList: function() {
            if($("ul.ui-autocomplete").is(":hidden")) {
                $("#os_input").autocomplete("search", "");
            }
        },
        
        builderSelect: function(){
            $.getJSON( Common.apiUrl + "/stackstudio/v1/packed_images/builders/" + $("#image_type_select").val().replace('-',''), function( builder ) {
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
            }else if(event.target.text === "DevOps Tool"){
                $("#devops_settings").show('slow');
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
            
            //base_image
            var base_image = {};
            
            var clouds = [];
            $("input[name='clouds_select']:checkbox:checked").each(function(){  clouds.push($(this).val());   });
            
            base_image.name = $('#image_template_name_input').val();
            base_image.clouds = clouds;
            base_image.os = $('#os_input').val();

            var packed_image = this.map_base(base_image);
            
            this.currentImageTemplate = new PackedImage(packed_image);
            this.currentImageTemplate.save();
        },
        
        map_base: function(base){
            var builders = [];
            var provisioners = [];
            for (var i in base.clouds) {
                if(base.clouds[i] == 'aws'){
                    var mappings = undefined;
                    $.ajax({
                      url: '/samples/awsImages.json',
                      async: false,
                      success: function(data) {
                        mappings = data;
                      }
                    });
                    for(var i in mappings){
                        if(mappings[i].label == $('#os_input').val()){
                            var aws = {
                                        "type": "amazon-ebs",
                                        "access_key": $("#aws_cred_select option:selected").attr('data-ak'),
                                        "secret_key": $("#aws_cred_select option:selected").attr('data-sk'),
                                        "region": $("#aws_region_select").val(),
                                        'source_ami' : mappings[i].region[$("#aws_region_select").val()],
                                        "instance_type": $("#instance_type_select").val(),
                                        "ssh_username": "ubuntu",
                                        "ami_name": $("#image_template_name_input").val() + '{timestamp}'
                                       };
                            builders.push(aws);
                        }
                    }
                }
                if(base.clouds[i] == 'openstack'){
                    
                }
            }
            
            return {'builders':builders,'provisioners':provisioners};
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
