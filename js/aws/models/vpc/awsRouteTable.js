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
		}
    });

    return RouteTable;
});
