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

    // RouteTable Model
    // ----------

    /**
     *
     * @name RouteTable
     * @constructor
     * @category ObjectStorage
     * @param {Object} initialization object.
     * @returns {Object} Returns a RouteTable instance.
     */
    var RouteTable = ResourceModel.extend({

        idAttribute: "id",
        
        /** Default attributes for compute */
        defaults: {
            id: '',
            vpc_id: '',
            routes: [],
            associations: [],
            propagating_vpn: [],
            tags: []
		},

        create: function(options, credentialId, region) {
            // debugger
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/compute/route_tables?cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", {"route_table": options}, "routeTableAppRefresh");
        },

        destroy: function(credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/compute/route_tables/" + this.attributes.id + "?_method=DELETE&cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", undefined, "routeTableAppRefresh");
        },

        associate: function(options, credentialId, region) {
            // debugger
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/compute/route_tables/" + this.attributes.id + "/associate?cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", {"subnet_id": options.subnet_id}, "routeTableAppRefresh");
        }
    });

    return RouteTable;
});
