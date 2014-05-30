/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true */
define([
        'jquery',
        'models/resource/resourceModel',
        'common',
        'spinner',
        'messenger'
], function( $,ResourceModel, Common, Spinner, Messenger ) {
    'use strict';

    var PackedImage = ResourceModel.extend({

        defaults: {

        },
        
        save: function() {
            var url = Common.apiUrl + "/stackstudio/v1/packed_images/save?uid=" + Common.account.org_id;
            if(this.attributes.doc_id !== "test"){
                url = Common.apiUrl + "/stackstudio/v1/packed_images/save?uid=" + Common.account.org_id + "&docid=" + this.attributes.doc_id;
            }
            this.sendAjaxAction(url, "POST", {"packed_image": this.attributes.packed_image,"name":this.attributes.name,"base_image":this.attributes.base_image}, "packedImageAppRefresh", "Image Saved...");
            //this.deployIndicator();
        },
        
        deploy: function() {
            var url = Common.apiUrl + "/stackstudio/v1/packed_images/deploy?uid=" + Common.account.org_id + "&doc_id=" + this.attributes.doc_id;
            this.sendAjaxAction(url, "POST", undefined, "packedImageAppRefresh", "Deploying "+this.attributes.name+"...");
            this.deployIndicator();
        },
        
        deployIndicator: function(){
            var spinnerOptions = {
                //lines: 13, // The number of lines to draw
                length: 4, // The length of each line
                width: 2, // The line thickness
                radius: 1, // The radius of the inner circle
                corners: 1, // Corner roundness (0..1)
                rotate: 0, // The rotation offset
                color: '#ffffff', // #rgb or #rrggbb
                speed: 1, // Rounds per second
                trail: 60, // Afterglow percentage
                shadow: false, // Whether to render a shadow
                hwaccel: false, // Whether to use hardware acceleration
                className: 'spinner', // The CSS class to assign to the spinner
                zIndex: 2e9, // The z-index (defaults to 2000000000)
                top: 0, // Top position relative to parent in px
                left: 0 // Left position relative to parent in px
            };
            new Spinner(spinnerOptions).spin($("#navLoad").get(0));
            $("#navLoad").show("fast").append("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Deploying "+this.attributes.name).click(function() {
              $(this).hide('slow').empty();
              new Messenger().post({type:"success", message:this.attributes.name+" Deployed..."});
            });
        },
        
        destroy: function(){
            var url = Common.apiUrl + "/stackstudio/v1/packed_images/templates/" + Common.account.org_id + "/" + this.attributes.doc_id + "?_method=DELETE";
            this.sendAjaxAction(url, "POST", undefined, "packedImageAppDelete", "Image Deleted...");
        }

    });

    return PackedImage;
});