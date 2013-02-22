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
        'common'
], function( $, Backbone, Common ) {
    'use strict';

    // File Model
    // ----------

    var File = Backbone.Model.extend({

        idAttribute: "key",
        
        defaults: {
            key: '',
            cache_control: '',
            content_disposition: '',
            content_encoding: '',
            content_length: 0,
            content_md5: '',
            content_type: '',
            etag: '',
            expires: '',
            last_modified: '',
            metadata: {},
            owner: {},
            storage_class: '',
            encryption: '',
            version: ''
        }
    });

    return File;
});
