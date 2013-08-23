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
        'text!templates/google/compute/googleImageCreateTemplate.html',
        '/js/google/models/compute/googleImage.js',
        'icanhaz',
        'common'
        
], function( $, _, Backbone, DialogView, imageCreateTemplate, Image, ich, Common ) {
    
    /**
     * googleImageCreateView is UI form to create compute.
     *
     * @name ImageCreateView
     * @constructor
     * @category Compute
     * @param {Object} initialization object.
     * @returns {Object} Returns a googleImageCreateView image.
     */
    
    var GoogleImageCreateView = DialogView.extend({

        credentialId: undefined,

        region: undefined,
        
        image: new Image(),
        
        kernels: undefined,
        
        // Delegated events for creating new images, etc.
        events: {
            "dialogclose": "close"
        },

        initialize: function(options) {
            this.credentialId = options.cred_id;
            this.region = options.region;
            this.kernels = options.kernels;
            console.log(this.kernels);
            var createView = this;
            var compiledTemplate = _.template(imageCreateTemplate);
            this.$el.html(compiledTemplate);

            this.$el.dialog({
                autoOpen: true,
                title: "Create Compute Image",
                resizable: false,
                width: 410,
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
            
            $("#kernel_input").empty();
            this.kernels.forEach(
                function addKernel(value) { 
                    $("#kernel_input").append("<option>"+value+"</option>");
                }
            );
            $("#kernel_input").selectmenu();
        },

        render: function() {
        },
        
        create: function() {
            var newImage = this.image;
            var imge = {};
            imge.raw_disk = {};
            
            var issue = false;
            
            if($("#name_input").val() !== "" ) {
                imge.name = $("#name_input").val();
            }else {
                issue = true;
            }
            
            if($("#description_input").val() !== "" ) {
                imge.description = $("#description_input").val();
            }else {
                issue = true;
            }
            
            if($("#kernel_input").val() !== "" ) {
                imge.preferred_kernel = $("#kernel_input").val();
            }else {
                issue = true;
            }
            
            if($("#source_input").val() !== "" ) {
                imge.raw_disk.source = $("#source_input").val();
            }else {
                issue = true;
            }
            
            if($("#container_input").val() !== "" ) {
                imge.raw_disk.sourceType = $("#container_input").val();
            }else {
                issue = true;
            }
            
            if(!issue) {
                newImage.create(imge, this.credentialId);
                this.$el.dialog('close');
            } else {
                Common.errorDialog("Invalid Request", "Please supply all required fields.");
            }
        }
    });
    
    return GoogleImageCreateView;
});
