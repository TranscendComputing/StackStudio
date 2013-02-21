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
        'text!templates/aws/block_storage/awsSnapshotCreateTemplate.html',
        '/js/aws/models/block_storage/awsSnapshot.js',
        'common'  
], function( $, _, Backbone, snapshotCreateTemplate, Snapshot, Common ) {

    var VolumeCreateView = Backbone.View.extend({
        
        tagName: "div",
        
        credentialId: undefined,       
        
        template: _.template(snapshotCreateTemplate),
        
        snapshot: new Snapshot(),
        
        volume: undefined,

        events: {
            "dialogclose": "close"
        },

        initialize: function(options) {
            this.credentialId = options.cred_id;
            this.volume = options.volume;
            var createView = this;
            this.$el.html(this.template);

            this.$el.dialog({
                autoOpen: true,
                title: "Create Snapshot",
                width:500,
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
            var volumeName = "";
            if(this.volume.attributes.tags && this.volume.attributes.tags.hasOwnProperty("Name")) {
                volumeName = " (" + this.volume.attributes.tags.Name + ")";
            }
            $("#volume_display").text(this.volume.attributes.id + volumeName);
        },
        
        render: function() {
            
        },
        
        close: function() {
            this.$el.remove();
        },
        
        cancel: function() {
            this.$el.dialog('close');
        },
        
        create: function() {
            var newSnapshot = this.snapshot;
            var options = {};
            options.volume_id = this.volume.attributes.id;
            
            if($("#snapshot_name").val() !== "") {
                options.tags = {"Name": $("#snapshot_name").val()};
            }
            
            if($("#snapshot_description").val() !== "") {
                options.description = $("#snapshot_description").val();
            }

            newSnapshot.create(options, this.credentialId);
            this.$el.dialog('close'); 
        }

    });
    
    return VolumeCreateView;
});
