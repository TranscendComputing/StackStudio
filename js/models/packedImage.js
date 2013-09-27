/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true */
define([
        'models/resource/resourceModel',
        'common'
], function( ResourceModel, Common ) {
    'use strict';

    var PackedImage = ResourceModel.extend({

        defaults: {

        },
        
        save: function() {
            var url = Common.apiUrl + "/stackstudio/v1/packed_images/save?uid=" + sessionStorage.org_id;
            this.sendAjaxAction(url, "POST", {"packed_image": this.attributes}, "packedImageAppRefresh");
        },

    });

    return PackedImage;
});