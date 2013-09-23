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
        'common',
        'icanhaz',
        'views/dialogView',
        'text!templates/openstack/block_storage/openstackSnapshotCreateTemplate.html',
        '/js/openstack/collections/block_storage/openstackSnapshots.js',
        '/js/openstack/collections/block_storage/openstackVolumes.js',
        'jquery.multiselect',
        'jquery.multiselect.filter'
], function( $, _, Backbone, Common, ich, DialogView, snapshotCreateTemplate, Snapshots, Volumes ) {

    var VolumeCreateView = DialogView.extend({
        
        credentialId: undefined,

        region: undefined,
        
        template: snapshotCreateTemplate,
        
        collection: new Snapshots(),

        events: {
            "dialogclose": "close",
            "change #volume_select": "setSelectedVolume"
        },

        initialize: function(options) {
            this.credentialId = options.cred_id;
            this.region = options.region;
            this.volume = options.volume;
            if(this.volume)
            {
                this.renderView();
            }else{
                this.volumes = new Volumes();
                this.volumes.on("reset", function(){
                    this.renderView();
                }, this);
                this.volumes.fetch({ data: $.param({ cred_id: this.credentialId, region: this.region}), reset: true });
            }
        },
        
        render: function() {
            // Use render view instead
        },

        // User renderView here because this view is rendered differently
        // depending on conditions
        renderView: function() {
            var createView = this;
            ich.addTemplate("snapshot_create_template", this.template);

            if(this.volume)
            {
                this.$el.html( ich.snapshot_create_template(this.volume.attributes) );
            }else{
                this.$el.html( ich.snapshot_create_template({list: true, volumes: this.volumes.toJSON()}) );
            }

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

            if(!this.volume)
            {
                this.volume = this.volumes.at(0);
            }
        },

        setSelectedVolume: function(event) {
            var volId = $(event.target).find('option:selected').data().id;
            this.volume = this.volumes.get(volId);
            var newSnapName = this.volume.get("name") + "Snapshot";
            var newSnapDesc = this.volume.get("name") + "Snapshot Description";
            $("#snapshot_name").val(newSnapName);
            $("#snapshot_description").val(newSnapDesc);
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
