/*!
 * (c) Copyright 2012-2013 Transcend Computing, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the License);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an AS IS BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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

    var RelationalDatabase = ResourceModel.extend({

        defaults: {
            id: '',
            engine: '',
            engine_version: '',
            state: '',
            allocated_storage: 0,
            availability_zone: '',
            flavor_id: '',
            endpoint: {},
            read_replica_source: '',
            read_replica_identifiers: [],
            master_username: '',
            multi_az: false,
            created_at: '',
            last_restorable_time: '',
            auto_minor_version_upgrade: false,
            pending_modified_values: {},
            preferred_backup_window: '',
            preferred_maintenance_window: '',
            db_name: '',
            db_security_groups: [],
            db_parameter_groups: [],
            backup_retention_period: 0,
            license_model: '',
            db_subnet_group_name: ''
        },

        create: function(options, credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/rds/databases?cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", {"relational_database": options}, "rdsAppRefresh");
        },

        destroy: function(credentialId, region) {
            var url = Common.apiUrl + "/stackstudio/v1/cloud_management/aws/rds/databases/" + this.attributes.id + "?_method=DELETE&cred_id=" + credentialId + "&region=" + region;
            this.sendAjaxAction(url, "POST", undefined, "rdsAppRefresh");
        }
    });

    return RelationalDatabase;
});
