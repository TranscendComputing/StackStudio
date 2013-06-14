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
        '/js/aws/models/queue/awsQueue.js',
        'common'
], function( $, Backbone, Queue, Common ) {
    'use strict';


    var QueueList = Backbone.Collection.extend({

        model: Queue,

        url: Common.apiUrl + '/stackstudio/v1/cloud_management/aws/queue/queues'
        
    });

    return QueueList;

});
