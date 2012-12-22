package com.momentumsi.c9.representers
{
	import mx.collections.ArrayCollection;

	[Bindable]
	public class CacheClusterRepresenter extends RepresenterBase
	{
		public var securityGroupsCollection:ArrayCollection;
		public var nodesCollection:ArrayCollection;
		public function CacheClusterRepresenter(data:Object)
		{
			super(data);
			securityGroupsCollection = new ArrayCollection(data.security_groups as Array);
			nodesCollection = new ArrayCollection(data.nodes as Array);
		}
		
		public function get name():String
		{
			return data.id;
		}
		
		public function get nodeType():String
		{
			return data.node_type;
		}
		
		public function get numNodes():String
		{
			return data.num_nodes;
		}
		
		public function get autoUpgrade():String
		{
			if(data.auto_minor_version_upgrade)
			{
				return data.auto_minor_version_upgrade;
			}else{
				return false.toString();
			}			
		}
		
		public function get parameterGroup():String
		{
			return data.parameter_group["CacheParameterGroupName"];
		}
		
		public function get securityGroups():String
		{
			var securityGroupsArray:Array = [];
			for each(var group:Object in securityGroupsCollection)
			{
				securityGroupsArray.push(group.CacheSecurityGroupName);
			}
			return securityGroupsArray.join(",\n");
		}
		
		public function get state():String
		{
			return data.status;
		}
		
		public function get engine():String
		{
			return data.engine;
		}
		
		public function get engineVersion():String
		{
			return data.engine_version;
		}
		
		public function get port():String
		{
			return data.port;
		}
		
		public function get zone():String
		{
			return data.zone;
		}
		
		public function get maintenanceWindow():String
		{
			var window:String = data.maintenance_window;
			return window.toUpperCase();
		}
	}
}