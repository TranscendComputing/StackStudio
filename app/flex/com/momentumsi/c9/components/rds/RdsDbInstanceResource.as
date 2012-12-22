package com.momentumsi.c9.components.rds
{
	import com.momentumsi.c9.components.cfn.CloudFormationTemplate;
	
	import mx.collections.ArrayCollection;

	public class RdsDbInstanceResource
	{
		public var dbSnapshotIdentifier:Object;
		public var allocatedStorage:Object;
		public var availabilityZone:Object;
		public var backupRetentionPeriod:Object;
		public var dbInstanceClass:Object;
		public var dbName:Object;
		public var dbParameterGroup:Object;
		public var dbSecurityGroups:Array;
		public var dbSubnetGroupName:Object;
		public var engine:Object;
		public var engineVersion:Object;
		public var licenseModel:Object;
		public var masterUsername:Object;
		public var masterUserPassword:Object;
		public var port:Object;
		public var preferredBackupWindow:Object;
		public var preferredMaintenanceWindow:Object;
		public var multiAZ:Object;
		public var currentTemplate:CloudFormationTemplate = new CloudFormationTemplate;
		
		public function RdsDbInstanceResource()
		{
			/*
			dbSnapshotIdentifier:Object;
			allocatedStorage:Object;
			availabilityZone:Object;
			backupRetentionPeriod:Object;
			dbInstanceClass:Object;
			dbName:Object;
			dbParameterGroup:Object;
			dbSecurityGroups:Array;
			dbSubnetGroupName:Object;
			engine:Object;
			engineVersion:Object;
			licenseModel:Object;
			masterUsername:Object;
	        masterUserPassword:Object;
			port:Object;
			preferredBackupWindow:Object;
			preferredMaintenanceWindow:Object;
			multiAZ:Object;
			*/
		}
		
		public function removeDBResources():Object
		{
			//removeDBSubnetGroupFromResources();
			removeDBSecurityGroupFromResources();
			//removeDBSecurityGroupIngressesFromResources();
			
		}
		
		private function removeDBSecurityGroupFromResources():void
		{
			for(var index:int; index < dbSecurityGroups.length; index++)
			{
				try{
					currentTemplate.removeResource(dbSecurityGroups[index]['Ref']);
				}catch(error:Error){
					//Security group does not reference another resource
				}				
			}
		}

		
	}
}