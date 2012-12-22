package com.momentumsi.c9.models.resources
{
	import com.momentumsi.c9.constants.ResourceType;
	import com.momentumsi.c9.models.Element;
	import com.momentumsi.c9.models.ProjectVersion;
	
	import flash.events.Event;
	
	import mx.collections.ArrayCollection;
	
	[Bindable]
	public class ElastiCacheCluster extends Element
	{
		public var autoMinorVersionUpgrade:Object;
		public var cacheNodeType:Object;
		public var cacheParameterGroupName:Object;
		public var cacheSecurityGroupNames:Array;
		public var engine:Object;
		public var engineVersion:Object;
		public var notificationTopicArn:Object;
		public var numCacheNodes:Object;
		public var port:Object;
		public var preferredAvailabilityZone:Object;
		public var preferredMaintenanceWindow:Object;
		
		public var metadata:Object;
		public var deletionPolicy:String;
		public var dependsOn:Object;
		
		public function ElastiCacheCluster(element:Element)
		{
			super(element.id, element.name, element.elementType, element.projectId);
			properties = element.properties;
			elementGroup = ELEMENT_GROUP_RESOURCE;
			elementType = ResourceType.CACHE_CLUSTER;
		}
		
		private var _properties:Object;
		override public function get properties():Object
		{
			_properties = new Object();
			
			if(autoMinorVersionUpgrade != null)
			{
				_properties["AutoMinorVersionUpgrade"] = autoMinorVersionUpgrade;
			}
			if(cacheParameterGroupName != null)
			{
				_properties["CacheParameterGroupName"] = cacheParameterGroupName;
			}
			if(engineVersion != null)
			{
				_properties["EngineVersion"] = engineVersion;
			}
			if(notificationTopicArn != null)
			{
				_properties["NotificationTopicArn"] = notificationTopicArn;
			}
			if(port != null)
			{
				_properties["Port"] = port;
			}
			if(preferredAvailabilityZone != null)
			{
				_properties["PreferredAvailabilityZone"] = preferredAvailabilityZone;
			}
			if(preferredMaintenanceWindow != null)
			{
				_properties["PreferredMaintenanceWindow"] = preferredMaintenanceWindow;
			}
			
			_properties["CacheNodeType"] = cacheNodeType;
			_properties["CacheSecurityGroupNames"] = cacheSecurityGroupNames;
			_properties["Engine"] = engine;
			_properties["NumCacheNodes"] = numCacheNodes;
			
			var props:Object = _properties;
			_properties = new Object();
			_properties["Properties"] = props;
			
			if(metadata != null)
			{
				_properties["Metadata"] = metadata;
			}
			if(deletionPolicy != null)
			{
				_properties["DeletionPolicy"] = deletionPolicy;
			}
			if(dependsOn != null)
			{
				_properties["DependsOn"] = dependsOn;
			}
			_properties["Type"] = elementType;
			return _properties;			
		}
		
		override public function set properties(value:Object):void
		{
			_properties = value;
			
			metadata = value["Metadata"];
			deletionPolicy = value["DeletionPolicy"];
			dependsOn = value["DependsOn"];
			
			value = value["Properties"];
			if(value != null)
			{
				autoMinorVersionUpgrade = value["AutoMinorVersionUpgrade"];
				cacheParameterGroupName = value["CacheParameterGroupName"];
				engineVersion = value["EngineVersion"];
				notificationTopicArn = value["NotificationTopicArn"];
				port = value["Port"];
				preferredAvailabilityZone = value["PreferredAvailabilityZone"];
				preferredMaintenanceWindow = value["PreferredMaintenanceWindow"];
				cacheNodeType = value["CacheNodeType"];
				cacheSecurityGroupNames = value["CacheSecurityGroupNames"];
				engine = value["Engine"];
				numCacheNodes = value["NumCacheNodes"];
			}
		}
		
		public function removeClusterResources(version:ProjectVersion):void
		{
			removeParameterGroupFromResources(version);
			removeSecurityGroupIngresses(version);
			removeSecurityGroupsFromResources(version);
		    version.deleteElementByName(name);
		}
		
		//If cacheParameterGroup references another resource, remove the resource.
		//Otherwise, parameter group is existing group, so when retrieving 'Ref' fails,
		//catch and return templateResources
		private function removeParameterGroupFromResources(version:ProjectVersion):void
		{
			//var currentResources:CloudFormationResources = new CloudFormationResources(templateResources);
			try{
				version.deleteElementByName(cacheParameterGroupName['Ref']);
			}catch(error:Error){
				//Parameter group does not reference another resource
			}
		}
		
		private function removeSecurityGroupsFromResources(version:ProjectVersion):void
		{
			for(var index:int; index < cacheSecurityGroupNames.length; index++)
			{
				try{
					version.deleteElementByName(cacheSecurityGroupNames[index]['Ref']);
				}catch(error:Error){
					//Security group does not reference another resource
				}				
			}
		}
		
		private function removeSecurityGroupIngresses(version:ProjectVersion):void
		{	
			var ingressCollection:ArrayCollection = new ArrayCollection();
			for each (var element:Element in version.elements)
			{
				if(element.elementType == "AWS::ElastiCache::SecurityGroupIngress")
				{
					var secGroupName:String;
					try{
						secGroupName = element.properties['Properties']['CacheSecurityGroupName']['Ref'];
					}catch(error:Error){
						secGroupName = element.properties['Properties']['CacheSecurityGroupName'];
					}
					
					for(var index:int; index < cacheSecurityGroupNames.length; index++)
					{
						try{
							if(cacheSecurityGroupNames[index]['Ref'] == secGroupName)
							{
								version.deleteElementByName(secGroupName);
							}
						}catch(error:Error){}
					}
				}
			}
		}
		
		public function addElastiCacheSecurityGroup(securityGroupElement:Element, version:ProjectVersion):void
		{
			var clusterSecGroupName:String = name + "SecurityGroup";
			var clusterSecGroupIngressName:String = clusterSecGroupName + "Ingress";
			// If cache security group is already referenced, return
			for(var i:int; i < cacheSecurityGroupNames.length; i++)
			{
				try
				{
					if(cacheSecurityGroupNames[i]['Ref'] == clusterSecGroupName)
					{
						return;
					}
				}catch(error:Error){}
			}
			
			if(version.getElementByName(clusterSecGroupName) == null)
			{
				var clusterSecGroupAttributes:Object = new Object();
				clusterSecGroupAttributes['Type'] = "AWS::ElastiCache::SecurityGroup";
				clusterSecGroupAttributes['Properties'] = new Object();
				clusterSecGroupAttributes['Properties']['Description'] = securityGroupElement.properties['Properties']['GroupDescription'];
				var clusterSecGroupElement:Element = new Element(null, clusterSecGroupName, "AWS::ElastiCache::SecurityGroup", projectId);
				clusterSecGroupElement.properties = clusterSecGroupAttributes;
				clusterSecGroupElement.save(version);
			}

			if(version.getElementByName(clusterSecGroupIngressName) == null)
			{
				var clusterSecGroupIngressAttributes:Object = new Object();
				clusterSecGroupIngressAttributes['Type'] = "AWS::ElastiCache::SecurityGroupIngress";
				clusterSecGroupIngressAttributes['Properties'] = new Object();
				clusterSecGroupIngressAttributes['Properties']['CacheSecurityGroupName'] = {Ref: clusterSecGroupName};
				clusterSecGroupIngressAttributes['Properties']['EC2SecurityGroupName'] = {Ref: securityGroupElement.name};
				var clusterSecGroupIngressElement:Element = new Element(null, clusterSecGroupIngressName, "AWS::ElastiCache::SecurityGroupIngress", projectId);
				clusterSecGroupIngressElement.properties = clusterSecGroupIngressAttributes;
				clusterSecGroupIngressElement.save(version);
			}
			
			cacheSecurityGroupNames.push({Ref: clusterSecGroupName});
			save(version);			
		}
	}
}