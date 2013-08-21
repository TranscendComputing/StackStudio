/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true */
define([
        'jquery',
        'backbone'
], function( $, Backbone ) {
    'use strict';

    var ChefEnvironment = Backbone.Model.extend({

        /** Default attributes for ChefEnvironment */
        defaults: {
            _rev: '',
            cookbook_versions: {},
            default_attributes: {},
            cloud_mappings: [],
            name: '',
            description: '',
            json_class: '',
            chef_type: '',
            override_attributes: {},
            attrs: null
        },
        
    });

    return ChefEnvironment;
});

