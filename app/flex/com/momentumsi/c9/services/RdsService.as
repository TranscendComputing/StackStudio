package com.momentumsi.c9.services
{
	import com.momentumsi.c9.events.rds.*;
	import com.momentumsi.c9.models.resources.DbInstance;
	import com.momentumsi.c9.representers.DbSnapshotRepresenter;
	
	import flash.events.Event;
	
	import mx.collections.ArrayCollection;
	import mx.rpc.events.FaultEvent;
	import mx.rpc.events.ResultEvent;

	[Event(name="dbResourcesSet", type="flash.events.Event")]
	[Event(name="securityGroupCreated", type="flash.events.Event")]
	[Event(name="dbParamGroupModified", type="flash.events.Event")]
	[Event(name="dbParamModifyError", type="mx.rpc.events.ResultEvent")]
	[Event(name="parameterGroupCreated", type="flash.events.Event")]
	[Event(name="dbRebooted", type="com.momentumsi.c9.events.rds.DbRebootedEvent")]
	[Event(name="dbRebootFailed", type="com.momentumsi.c9.events.rds.DbRebootFaultEvent")]
	[Event(name="readReplicaCreated", type="com.momentumsi.c9.events.rds.CreateReadReplicaResultEvent")]
	[Event(name="readReplicaFailed", type="com.momentumsi.c9.events.rds.CreateReadReplicaFaultEvent")]
	[Event(name="dbSecurityGroupAuthorized", type="com.momentumsi.c9.events.rds.AuthorizeIngressResultEvent")]
	[Event(name="authorizeRdsSecGrpIngressFailed", type="com.momentumsi.c9.events.rds.AuthorizeIngressFaultEvent")]
	[Event(name="dbSecurityGroupRevoked", type="com.momentumsi.c9.events.rds.RevokeIngressResultEvent")]
	[Event(name="revokeRdsSecGrpIngressFailed", type="com.momentumsi.c9.events.rds.RevokeIngressFaultEvent")]	
	[Event(name="dbInstanceCreated", type="com.momentumsi.c9.events.rds.CreateDBInstanceResultEvent")]
	[Event(name="dbInstanceFailed", type="com.momentumsi.c9.events.rds.CreateDBInstanceFaultEvent")]
	[Event(name="describeDbGroupsResult", type="com.momentumsi.c9.events.rds.DescribeDbSecuityGroupsResultEvent")]
	[Event(name="describeDbGroupsFault", type="com.momentumsi.c9.events.rds.DescribeDbSecurityGroupsFaultEvent")]
	[Event(name="restoreFromSnapshotResult", type="com.momentumsi.c9.events.rds.RestoreFromSnapshotResultEvent")]
	[Event(name="restoreFromSnapshotFault", type="com.momentumsi.c9.events.rds.RestoreFromSnapshotFaultEvent")]
	[Event(name="createDBSecurityGroupResult", type="com.momentumsi.c9.events.rds.CreateDBSecurityGroupResultEvent")]
	[Event(name="createDBSecurityGroupFault", type="com.momentumsi.c9.events.rds.CreateDBSecurityGroupFaultEvent")]
	
	[Bindable]
	public class RdsService extends CloudApiService
	{
		//Event Types
		public static const SECURITY_GROUP_CREATED:String = "securityGroupCreated";
		public static const RESOURCES_SET:String = "dbResourcesSet";
		public static const DB_PARAM_GROUP_MODIFIED:String = "dbParamGroupModified";
		public static const DB_PARAM_MODIFY_ERROR:String = "dbParamModifyError";
		public static const PARAMETER_GROUP_CREATED:String = "parameterGroupCreated";
		
		//Actions
		public static const DELETE_SNAPSHOT:String = "delete_db_snapshot";
		public static const RESTORE_FROM_SNAPSHOT:String = "restore_db_instance_from_db_snapshot";
		public static const DESCRIBE_EVENTS:String = "describe_events";
		public static const CREATE_SNAPSHOT:String = "create_db_snapshot";
		public static const REBOOT_DB:String = "reboot_db_instance";
		public static const CREATE_READ_REPLICA:String = "create_read_replica";
		public static const AUTHORIZE_INGRESS:String = "authorize_db_security_group_ingress";
		public static const REVOKE_INGRESS:String = "revoke_db_security_group_ingress";
		public static const CREATE_DB_INSTANCE:String = "create_db_instance";
		public static const DESCRIBE_SECURITY_GROUPS:String = "describe_db_security_groups";
		public static const CREATE_SECURITY_GROUP:String = "create_db_security_group";
		
		/***********************
		 * 	Database Resources
		 * *********************/
		public var parameterGroups:ArrayCollection = new ArrayCollection();
		public var securityGroups:ArrayCollection = new ArrayCollection();
		public var engineVersions:ArrayCollection = new ArrayCollection();
		public var prices:ArrayCollection = new ArrayCollection();
		public var snapshots:ArrayCollection = new ArrayCollection();
		public var events:ArrayCollection = new ArrayCollection();
		
		public var dbInstance:DbInstance;
		public var dbIdentifier:String;
		public var dbSnapshotId:String;
		
		public var instanceClasses:ArrayCollection = new ArrayCollection([
			{instanceClass: "db.t1.micro"},
			{instanceClass: "db.m1.small"},
			{instanceClass: "db.m1.large"},
			{instanceClass: "db.m1.xlarge"},
			{instanceClass: "db.m2.xlarge"},
			{instanceClass: "db.m2.2xlarge"},
			{instanceClass: "db.m2.4xlarge"}
		]);
		
		public var eucaClasses:ArrayCollection = new ArrayCollection([
			{instanceClass: "db.m1.large"},
			{instanceClass: "db.m1.xlarge"}
		]);
		
		public var openstackClasses:ArrayCollection = new ArrayCollection([
			{instanceClass: "db.m1.medium"},
			{instanceClass: "db.m1.large"},
			{instanceClass: "db.m1.xlarge"}
		]);
		
		public function RdsService(rootURL:String=null, destination:String=null)
		{
			super(rootURL, destination);
			serviceType = RDS_SERVICE;
		}
		
		/****************
		 * 	RDS API Actions
		 * **************/
		
		public function getRdsResources():void
		{
			action = "get_rds_resources";
			addEventListener(ResultEvent.RESULT, getRdsResources_resultHandler);
			send();
		}
		
		public function createDatabase(name:String, parameters:Object):void
		{
			parameters.DBInstanceIdentifier = name;
			setPost();
			action = CREATE_DB_INSTANCE;
			request = parameters;
			addEventListener(ResultEvent.RESULT, createDatabase_resultHandler);
			addEventListener(FaultEvent.FAULT, createDatabase_faultHandler);
			send();
		}

		public function createDbSnapshot(snapshotName:String):void
		{
			action = CREATE_SNAPSHOT;
			request = {db_instance_identifier: dbIdentifier, db_snapshot_identifier: snapshotName};
			send();
		}
		
		public function describeDbSecurityGroups(groupName:String=null):void
		{
			action = DESCRIBE_SECURITY_GROUPS;
			addEventListener(ResultEvent.RESULT, describeDbSecurityGroups_resultHandler);
			addEventListener(FaultEvent.FAULT, describeDbSecurityGroups_faultHandler);
			send({physical_id: groupName});
		}
		
		public function describeDbSnapshots():void
		{
			snapshots.removeAll();
			action = "describe_db_snapshots";
			request = {db_instance_identifier: dbIdentifier};
			addEventListener(ResultEvent.RESULT, describeDbSnapshots_resultHandler);
			send();
		}
		
		public function deleteSnapshot():void
		{
			action = DELETE_SNAPSHOT;
			request = {db_snapshot_identifier: dbSnapshotId};
			addEventListener(ResultEvent.RESULT, deleteDbSnapshot_resultHandler);
			send();
		}
		
		public function restoreFromSnapshot(dbInstanceIdentifier:String, parameters:Object):void
		{
			setPost();
			action = RESTORE_FROM_SNAPSHOT;
			request = {
				db_instance_identifier: dbInstanceIdentifier, 
				db_snapshot_identifier: dbSnapshotId, 
				options: parameters
			};
			addEventListener(ResultEvent.RESULT, restoreFromSnapshot_resultHandler);
			addEventListener(FaultEvent.FAULT, restoreFromSnapshot_faultHandler);
			send();
		}
		
		public function describeEvents():void
		{
			action = DESCRIBE_EVENTS;
			request = {db_instance_identifier: dbIdentifier};
			addEventListener(ResultEvent.RESULT, describeEvents_resultHandler);
			send();
		}
		
		public function createDbParameterGroup(name:String, description:String, family:String):void
		{
			action = "create_db_parameter_group";
			request = {name: name, description: description, family: family};
			addEventListener(ResultEvent.RESULT, createDbParameterGroup_resultHandler);
			send();
		}
		
		public function createDbSecurityGroup(name:String, description:String):void
		{
			setPost();
			action = CREATE_SECURITY_GROUP;
			request = {name: name, description: description};
			addEventListener(ResultEvent.RESULT, createDbSecurityGroup_resultHandler);
			addEventListener(FaultEvent.FAULT, createDbSecurityGroup_faultHandler);
			send();
		}
		
		public function modifyDbParameterGroup(parameterGroupName:String, parameters:Array):void
		{
			setPost();
			action = "modify_db_parameter_group";
			request = {group_name: parameterGroupName, group_parameters: parameters};
			addEventListener(ResultEvent.RESULT, modifyDbParameterGroup_resultHandler);
			addEventListener(FaultEvent.FAULT, modifyDbParameterGroup_faultHandler);
			send();
		}
		
		public function rebootDb():void
		{
			setPost();
			action = REBOOT_DB;
			request = {db_instance_identifier: dbIdentifier};
			addEventListener(ResultEvent.RESULT, rebootDb_resultHandler);
			addEventListener(FaultEvent.FAULT, rebootDb_faultHandler);
			send();
		}
		
		public function createReadReplica(readReplica:Object):void
		{
			setPost();
			action = CREATE_READ_REPLICA;
			readReplica["source_identifier"] = dbIdentifier;
			request = readReplica;
			addEventListener(ResultEvent.RESULT, createReadReplica_resultHandler);
			addEventListener(FaultEvent.FAULT, createReadReplica_faultHandler);
			send();
		}
		
		public function authorizeDbSecurityGroupIngress(securityGroupName:String, options:Object):void
		{
			setPost();
			action = AUTHORIZE_INGRESS;
			request = {name: securityGroupName, options: options};
			addEventListener(ResultEvent.RESULT, authorizeDbSecurityGroupIngress_resultHandler);
			addEventListener(FaultEvent.FAULT, authorizeDbSecurityGroupIngress_faultHandler);
			send();
		}
		
		public function revokeDbSecurityGroupIngress(securityGroupName:String, options:Object):void
		{
			setPost();
			action = REVOKE_INGRESS;
			request = {name: securityGroupName, options: options};
			addEventListener(ResultEvent.RESULT, revokeDbSecurityGroupIngress_resultHandler);
			addEventListener(FaultEvent.FAULT, revokeDbSecurityGroupIngress_faultHandler);
			send();
		}
		
		/*private function resetParameters(groupName:String):void
		{
			action = "reset_db_parameter_group";
			request = {group_name: groupName};
			addEventListener(ResultEvent.RESULT, modifyDbParameterGroup_resultHandler);
			addEventListener(FaultEvent.FAULT, modifyDbParameterGroup_faultHandler);
			send();
		}*/
		
		/****************
		 * 	RDS Result Handlers
		 * **************/
		
		private function getRdsResources_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, getRdsResources_resultHandler);
			var responseCollection:ArrayCollection;
			if(result["parameter_groups"] != null)
			{
				parameterGroups = new ArrayCollection(result["parameter_groups"] as Array);
			}
			if(result["security_groups"] != null)
			{
				securityGroups = new ArrayCollection(result["security_groups"] as Array);
			}
			engineVersions = new ArrayCollection(result["engine_versions"] as Array);
			prices = new ArrayCollection(result["prices"] as Array);
			
			if(dbInstance)
			{
				if(dbInstance.dbParameterGroupName && !(dbInstance.dbParameterGroupName is String))
				{
					parameterGroups.addItemAt(dbInstance.dbParameterGroupName, 0);
				}
				if(dbInstance.engineVersion && !(dbInstance.engineVersion is String))
				{
					engineVersions.addItemAt(dbInstance.engineVersion, 0);
				}
			}
			dispatchEvent(new Event(RESOURCES_SET));
		}
		
		private function createDatabase_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, createDatabase_resultHandler);
			dispatchEvent(new CreateDBInstanceResultEvent(result));
		}
		
		private function describeDbSecurityGroups_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, describeDbSecurityGroups_resultHandler);
			dispatchEvent(new DescribeDbSecuityGroupsResultEvent(result));
		}
		
		private function describeDbSnapshots_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, describeDbSnapshots_resultHandler);
			var coll:ArrayCollection = new ArrayCollection(result as Array);
			snapshots.removeAll();
			for each(var snapshot:Object in coll)
			{
				snapshots.addItem(new DbSnapshotRepresenter(snapshot));
			}
		}
		
		private function restoreFromSnapshot_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, restoreFromSnapshot_resultHandler);
			dispatchEvent(new RestoreFromSnapshotResultEvent(result));
		}
		
		private function deleteDbSnapshot_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, deleteDbSnapshot_resultHandler);
		}
		
		private function describeEvents_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, describeEvents_resultHandler);
			events = new ArrayCollection(result as Array);
		}
		
		private function createDbParameterGroup_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, createDbParameterGroup_resultHandler);
			parameterGroups.addItemAt(result, 0);
			dispatchEvent(new Event(PARAMETER_GROUP_CREATED));
		}
		
		private function createDbSecurityGroup_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, createDbSecurityGroup_resultHandler);
			securityGroups.addItemAt(result, 0);
			dispatchEvent(new CreateDBSecurityGroupResultEvent(result));
		}
		
		private function modifyDbParameterGroup_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, modifyDbParameterGroup_resultHandler);
			dispatchEvent(new Event(DB_PARAM_GROUP_MODIFIED));
		}
		
		private function rebootDb_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, rebootDb_resultHandler);
			dispatchEvent(new DbRebootedEvent(result));
		}
		
		private function createReadReplica_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, createReadReplica_resultHandler);
			dispatchEvent(new CreateReadReplicaResultEvent(result));
		}
		
		private function authorizeDbSecurityGroupIngress_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, authorizeDbSecurityGroupIngress_resultHandler);
			dispatchEvent(new AuthorizeIngressResultEvent(result));
		}
		
		private function revokeDbSecurityGroupIngress_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, revokeDbSecurityGroupIngress_resultHandler);
			dispatchEvent(new RevokeIngressResultEvent(result));
		}
		
		/***
		 * Fault Handlers
		 * **/
		
		private function createDatabase_faultHandler(event:FaultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, createDatabase_faultHandler);
			dispatchEvent(new CreateDBInstanceFaultEvent(event.fault));
		}
		
		private function describeDbSecurityGroups_faultHandler(event:FaultEvent):void
		{
			removeEventListener(FaultEvent.FAULT, describeDbSecurityGroups_faultHandler);
			dispatchEvent(new DescribeDbSecurityGroupsFaultEvent(event.fault));
		}
		
		private function restoreFromSnapshot_faultHandler(event:FaultEvent):void
		{
			removeEventListener(FaultEvent.FAULT, restoreFromSnapshot_faultHandler);
			dispatchEvent(new RestoreFromSnapshotFaultEvent(event.fault));
		}
		
		private function modifyDbParameterGroup_faultHandler(event:FaultEvent):void
		{
			removeEventListener(FaultEvent.FAULT, modifyDbParameterGroup_faultHandler);
			dispatchEvent(new ResultEvent(DB_PARAM_MODIFY_ERROR, false, false, fault));
		}
		
		private function rebootDb_faultHandler(event:FaultEvent):void
		{
			removeEventListener(FaultEvent.FAULT, rebootDb_faultHandler);
			dispatchEvent(new DbRebootFaultEvent(event.fault));
		}
		
		private function createReadReplica_faultHandler(event:FaultEvent):void
		{
			removeEventListener(FaultEvent.FAULT, createReadReplica_faultHandler);
			dispatchEvent(new CreateReadReplicaFaultEvent(event.fault));
		}
		
		private function authorizeDbSecurityGroupIngress_faultHandler(event:FaultEvent):void
		{
			removeEventListener(FaultEvent.FAULT, authorizeDbSecurityGroupIngress_faultHandler);
			dispatchEvent(new AuthorizeIngressFaultEvent(event.fault));
		}
		
		private function revokeDbSecurityGroupIngress_faultHandler(event:FaultEvent):void
		{
			removeEventListener(FaultEvent.FAULT, revokeDbSecurityGroupIngress_faultHandler);
			dispatchEvent(new RevokeIngressFaultEvent(event.fault));
		}
		
		private function createDbSecurityGroup_faultHandler(event:FaultEvent):void
		{
			removeEventListener(FaultEvent.FAULT, createDbSecurityGroup_faultHandler);
			dispatchEvent(new CreateDBSecurityGroupFaultEvent(event.fault));
		}
		
	}
}