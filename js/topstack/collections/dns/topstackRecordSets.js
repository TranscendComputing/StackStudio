/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true */
define([
        'jquery',
        'backbone',
        'topstack/models/dns/topstackRecordSet',
        'common'
], function( $, Backbone, RecordSet, Common ) {
    'use strict';

    var RecordSetList = Backbone.Collection.extend({

        model: RecordSet,

        initialize: function(options) {
            this.url = Common.apiUrl + '/stackstudio/v1/cloud_management/topstack/dns/hosted_zones/' + options["hosted_zone_id"] + '/record_sets';
        }
        
    });
    
    return RecordSetList;

});
