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
        'common',
        'views/resource/resourceRowView',
        'jquery.dataTables',
        'jquery.dataTables.fnProcessingIndicator'
], function( $, _, Backbone, ich, Common , ResourceRowView ) {
    'use strict';

    var ResourceTreeView = Backbone.View.extend({

        credentialId: undefined,

        region: undefined,

        type: undefined,

        subtype: undefined,

        subView : undefined,

        cloudProvider : undefined,

        initialize : function ( options ) {
            this.credentialId = options.cred_id;
            this.region = options.region || "none";
            this.cloudProvider = options.cloudProvider;
            this.vdc = options.data_center;
            
            this.render();
        }
    });
    
    return ResourceTreeView;
});
