package com.momentumsi.c9.models.resources
{
	import com.momentumsi.c9.constants.ResourceType;
	import com.momentumsi.c9.models.Element;
	import com.momentumsi.c9.models.ProjectVersion;
	import com.momentumsi.c9.models.ResourceElement;
	import com.momentumsi.c9.utils.Helpers;
	import com.momentumsi.c9.utils.IntrinsicFunctionUtil;
	import com.momentumsi.c9.utils.VectorUtil;
	
	import flash.events.Event;
	
	import mx.collections.ArrayCollection;
	
	[Bindable]
	public class DbInstance extends ResourceElement
	{
		public static const NO_PREFERENCE:String = "No Preference";
		
		public var dbSnapshotIdentifier:Object;
		public var allocatedStorage:Object;
		public var availabilityZone:Object;
		public var backupRetentionPeriod:Object;
		public var dbInstanceClass:Object;
		public var dbName:Object;
		public var dbParameterGroupName:Object;
		public var dbSubnetGroupName:Object;
		public var engine:Object;
		public var engineVersion:Object;
		public var licenseModel:Object;
		public var masterUsername:Object;
		public var masterUserPassword:Object;
		public var port:Object;
		public var multiAZ:Object;
		
		private var _preferredBackupWindow:String;
		private var _preferredMaintenanceWindow:String;
		private var _dbSecurityGroups:Array;
		
		public function DbInstance(element:Element=null)
		{
			super(element);
			elementType = ResourceType.DB_INSTANCE;
			
			dbSnapshotIdentifier = _resourceProperties.DBSnapshotIdentifier;
			allocatedStorage = _resourceProperties.AllocatedStorage;
			availabilityZone = _resourceProperties.AvailabilityZone;
			backupRetentionPeriod = _resourceProperties.BackupRetentionPeriod;
			dbInstanceClass = _resourceProperties.DBInstanceClass;
			dbName = _resourceProperties.DBName;
			dbParameterGroupName = _resourceProperties.DBParameterGroupName;
			_dbSecurityGroups = _resourceProperties.DBSecurityGroups;
			dbSubnetGroupName = _resourceProperties.DBSubnetGroupName;
			engine = _resourceProperties.Engine;			
			engineVersion = _resourceProperties.EngineVersion;
			licenseModel = _resourceProperties.LicenseModel;
			masterUsername = _resourceProperties.MasterUsername;
			masterUserPassword = _resourceProperties.MasterUserPassword;
			port = _resourceProperties.Port
			_preferredBackupWindow = _resourceProperties.PreferredBackupWindow;
			_preferredMaintenanceWindow = _resourceProperties.PreferredMaintenanceWindow;
			multiAZ = _resourceProperties.MultiAZ;
		}
		
		public function get preferredBackupWindow():String 
		{
			return _preferredBackupWindow;
		}
		
		public function set preferredBackupWindow(value:String):void 
		{
			if(value == NO_PREFERENCE)
			{
				_preferredBackupWindow = null;
			}else{
				_preferredBackupWindow = value;
			}
		}
		
		public function get preferredMaintenanceWindow():String 
		{
			return _preferredMaintenanceWindow;
		}
		
		public function set preferredMaintenanceWindow(value:String):void 
		{
			if(value == NO_PREFERENCE)
			{
				_preferredMaintenanceWindow = null;
			}else{
				_preferredMaintenanceWindow = value;
			}
		}
		
		public function get dbSecurityGroups():ArrayCollection
		{
			return new ArrayCollection(_dbSecurityGroups);
		}
		
		public function set selectedSecurityGroups(value:Vector.<Object>):void
		{
			var selectedGroups:Array = VectorUtil.toArray(value);
			_dbSecurityGroups = Helpers.resetArrayWithPossibleProperty(selectedGroups, "id");
			dispatchEvent(new Event("securityGroupsUpdated"));
		}
		
		override public function get attributes():Object
		{
			var props:Object = new Object();
			
			if(dbSnapshotIdentifier != null)
			{
				props.DBSnapshotIdentifier = dbSnapshotIdentifier;
			}
			if(availabilityZone != null)
			{
				props.AvailabilityZone = availabilityZone;
			}
			if(backupRetentionPeriod != null)
			{
				props.BackupRetentionPeriod = backupRetentionPeriod;
			}			
			if(dbName != null)
			{
				props.DBName = dbName;
			}
			if(dbParameterGroupName != null)
			{
				props.DBParameterGroupName = dbParameterGroupName;
			}
			if(_dbSecurityGroups != null)
			{
				props.DBSecurityGroups = _dbSecurityGroups;
			}
			if(dbSubnetGroupName != null)
			{
				props.DBSubnetGroupName = dbSubnetGroupName;
			}
			if(engineVersion != null)
			{
				props.EngineVersion = engineVersion;
			}
			if(licenseModel != null)
			{
				props.LicenseModel = licenseModel;
			}
			if(port != null)
			{
				props.Port = port;
			}
			if(preferredBackupWindow != null)
			{
				props.PreferredBackupWindow = preferredBackupWindow;
			}
			if(preferredMaintenanceWindow != null)
			{
				props.PreferredMaintenanceWindow = preferredMaintenanceWindow;
			}
			if(multiAZ != null)
			{
				props.MultiAZ = multiAZ;
			}
			
			props.AllocatedStorage = allocatedStorage;
			props.DBInstanceClass = dbInstanceClass;
			props.Engine = engine;
			props.MasterUsername = masterUsername;
			props.MasterUserPassword = masterUserPassword;

			return props;
		}

		/**
		 * Removes db security groups from project
		 * */
		public function removeDbResources(version:ProjectVersion):void
		{
			for(var index:int=0; index < _dbSecurityGroups.length; index++)
			{
				if(!(_dbSecurityGroups[index] is String)){
					version.deleteElementByName(_dbSecurityGroups[index]["Ref"]);
					version.deleteNodeByName(_dbSecurityGroups[index]["Ref"]);
				}
			}
			version.deleteElementByName(name);
		}
		
		public function addRdsDbSecurityGroup(securityGroupElement:Element, version:ProjectVersion):void
		{
			var dbSecGroupName:String = name + "SecurityGroup";
			var dbSecGroupIngressRef:Object = {EC2SecurityGroupName: {Ref: securityGroupElement.name}};
			
			//If db security group already exists, set ingress to reference linked security group and return
			for each(var projElement:Element in version.elements)
			{
				if(dbSecGroupName == projElement.name)
				{
					projElement.properties['Properties']['DBSecurityGroupIngress'] = dbSecGroupIngressRef;
					projElement.save(version);
					return;
				}
			}
			
			var dbSecGroupAttributes:Object = new Object();
			dbSecGroupAttributes['Type'] = "AWS::RDS::DBSecurityGroup";
			dbSecGroupAttributes['Properties'] = new Object();
			dbSecGroupAttributes['Properties']['DBSecurityGroupIngress'] = dbSecGroupIngressRef;
			dbSecGroupAttributes['Properties']['GroupDescription'] = "Database access";
			var dbSecGroupElement:Element = new Element(null, dbSecGroupName, "AWS::RDS::DBSecurityGroup", projectId);
			dbSecGroupElement.properties = dbSecGroupAttributes;
			dbSecGroupElement.save(version);
			
			if(_dbSecurityGroups == null)
			{
				_dbSecurityGroups = []
			}
			_dbSecurityGroups.push({Ref: dbSecGroupName});
			save(version);
		}
		
		public function removeSecurityGroupRef(version:ProjectVersion):void
		{
			var dbSecurityGroup:DbSecurityGroup;
			var removeIndex:int = -1;
			var index:int;
			for(index=0; index < _dbSecurityGroups.length; index++)
			{
				if(!(_dbSecurityGroups[index] is String)){
					version.deleteElementByName(_dbSecurityGroups[index]["Ref"]);
					removeIndex = index;
				}
			}
			if(removeIndex != -1)
			{
				var newDbSecGroups:Array = new Array();
				for(index=0; index < _dbSecurityGroups.length; index++)
				{
					if(index != removeIndex)
					{
						newDbSecGroups.push(_dbSecurityGroups[index]);
					}
				}
				_dbSecurityGroups = newDbSecGroups;
				save(version);
			}
		}
		
		[Bindable(event="securityGroupsUpdated")]
		public function get securityGroupsDisplay():String
		{
			var displayArray:Array = [];
			for(var index:int=0; index < _dbSecurityGroups.length; index++)
			{
				displayArray.push(IntrinsicFunctionUtil.toDisplay(_dbSecurityGroups[index]));
			}
			return displayArray.join(", ");
		}
		
	}
}