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
        'icanhaz',
        'common'
], function( $, _, Backbone, ich, Common ) {
    Common.companyName = "DLT Solutions";
    Common.rssFeed = "http://feeds.feedburner.com/DltBlog";
    Common.serviceOfferings = 'samples/awsOfferings.json';
});