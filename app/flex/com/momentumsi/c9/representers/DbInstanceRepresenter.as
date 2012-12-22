package com.momentumsi.c9.representers
{
	import com.momentumsi.c9.utils.Helpers;
	
	import mx.collections.ArrayCollection;

	[Bindable]
	public class DbInstanceRepresenter extends RepresenterBase
	{
		public function DbInstanceRepresenter(data:Object)
		{
			super(data);
		}
		
		public function get id():String 
		{
			return data.id;
		}
		
		public function get engine():String 
		{
			return data.engine;
		}
		
		public function get engineVersion():String 
		{
			return data.engine_version;
		}
		
		public function get state():String 
		{
			return data.state;
		}
		
		public function get allocatedStorage():Number 
		{
			return data.allocated_storage as Number;
		}
		
		public function get availabilityZone():String 
		{
			return data.availability_zone;
		}
		
		public function get instanceType():String 
		{
			return data.flavor_id;
		}
		
		public function get endpointAddress():String
		{
			var endpoint:Object = data.endpoint;
			return endpoint.Address;
		}
		
		public function get endpointPort():Number
		{
			var endpoint:Object = data.endpoint;
			return endpoint.Port as Number;
		}
		
		public function get endpoint():String 
		{
			var endpoint:Object = data.endpoint;
			if(endpoint.Address == null)
			{
				return "Unavailable";
			}else{
				return endpoint.Address + ":" + endpoint.Port;
			}
		}
		
		public function get readReplicaSource():String 
		{
			return data.read_replica_source || "Unavailable";
		}
		
		public function get readReplicasDisplay():String 
		{
			var replicas:Array = data.read_replica_identifiers as Array;
			if(replicas.length == 0)
			{
				return "None";
			}else{
				return replicas.join(", ");
			}
		}
		
		public function get readReplicasCollection():ArrayCollection
		{
			return new ArrayCollection(data.read_replica_identifiers as Array);
		}
		
		public function get masterUsername():String 
		{
			return data.master_username;
		}
		
		public function get multiAz():Boolean 
		{
			return data.multi_az as Boolean;
		}
		
		public function get lastRestorableTime():String 
		{
			var dateString:String = data.last_restorable_time; 
			if(dateString != null)
			{
				return dateFormatter.format(Helpers.formatDate(dateString));
			}else{
				return "Unavailable";
			}
		}
		
		public function get autoMinorVersionUpgrade():Boolean 
		{
			return data.auto_minor_version_upgrade as Boolean;
		}
		
		public function get pendingModifiedValues():String 
		{
			return data.pending_modified_values;
		}
		
		public function get preferredBackupWindow():String 
		{
			return data.preferred_backup_window;
		}
		
		public function get preferredMaintenanceWindow():String 
		{
			var window:String = data.preferred_maintenance_window; 
			return window.toUpperCase();
		}
		
		public function get dbName():String 
		{
			return data.db_name;
		}
		
		public function get dbSecurityGroupsDisplay():String 
		{
			var groups:ArrayCollection =  new ArrayCollection(data.db_security_groups as Array);
			var groupNames:Array = [];
			for each(var group:Object in groups)
			{
				groupNames.push(group.DBSecurityGroupName);
			}
			return groupNames.join(", ");
		}
		
		public function get dbParameterGroupDisplay():String 
		{
			var groups:ArrayCollection =  new ArrayCollection(data.db_parameter_groups as Array);
			var groupNames:Array = [];
			for each(var group:Object in groups)
			{
				groupNames.push(group.DBParameterGroupName);
			}
			return groupNames.join(", ");
		}
		
		public function get backupRetentionPeriod():Number 
		{
			return data.backup_retention_period as Number;
		}
		
		public function get licenseModel():String 
		{
			return data.license_model;
		}
		
		public function get dbSubnetGroupName():String 
		{
			return data.db_subnet_group_name || "Unavailable";
		}
		
	}
}