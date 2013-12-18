/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true alert:true*/
define([
        'jquery',
        'backbone',
        'models/continuousIntegrationServer',
        'common'
], function( $, Backbone, ContinuousIntegrationServer, Common) {
    'use strict';

    var ContinuousIntegrationServerList = Backbone.Collection.extend({

        model: ContinuousIntegrationServer,

        url: function(options){return Common.apiUrl + '/api/v1/continuous_integration_servers/org/' + sessionStorage.org_id;}
    
    });

    return ContinuousIntegrationServerList;

});