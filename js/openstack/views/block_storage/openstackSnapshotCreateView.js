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
        'text!templates/openstack/block_storage/openstackSnapshotCreateTemplate.html',
        '/js/openstack/collections/block_storage/openstackSnapshots.js',
        'common'  
], function( $, _, Backbone, DialogView, snapshotCreateTemplate, Snapshots, Common ) {

    var VolumeCreateView = DialogView.extend({
        
        credentialId: undefined,

        region: undefined,
        
        template: _.template(snapshotCreateTemplate),
        
        collection: new Snapshots(),
        
        volume: undefined,

        events: {
            "dialogclose": "close"
        },

        initialize: function(options) {
            this.credentialId = options.cred_id;
            this.region = options.region;
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
            if(this.volume.has("name")) {
                volumeName = " (" + this.volume.get("name") + ")";
            }
            $("#volume_display").text(this.volume.get("id") + volumeName);
        },
        
        render: function() {
            
        },
        
        create: function() {
            var newSnapshot = this.collection.create({
                name: $("#snapshot_name").val(),
                description: $("#snapshot_description").val(),
                volume_id: this.volume.get("id")
            });
            newSnapshot.create(this.credentialId, this.region);
            this.$el.dialog('close'); 
        }

    });
    
    return VolumeCreateView;
});
