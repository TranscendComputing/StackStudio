package com.momentumsi.c9.components.elc
{
	import com.momentumsi.c9.components.cfn.CloudFormationTemplate;
	import com.momentumsi.c9.constants.ResourceType;
	
	import mx.collections.ArrayCollection;

	public class ElasticCacheResource
	{
		public var clusterName:String;
		public var type:String = ResourceType.CACHE_CLUSTER;
		//Required properties
		public var cacheNodeType:Object;
		public var cacheSecurityGroupNames:Array;
		public var engine:Object;
		public var numCacheNodes:Object;
		//Optional properties
		public var autoMinorVersionUpgrade:Object;
		public var cacheParameterGroupName:Object;		
		public var engineVersion:Object;
		public var notificationTopicArn:Object;
		public var port:Object;
		public var preferredAvailabilityZone:Object;
		public var preferredMaintenanceWindow:Object;
		public var currentTemplate:CloudFormationTemplate = new CloudFormationTemplate;
		
		public function ElasticCacheResource(newCluster:Object)
		{
			cacheNodeType = newCluster['CacheNodeType'];
			cacheSecurityGroupNames = newCluster['CacheSecurityGroupNames'];
			engine = newCluster['Engine'];
			numCacheNodes = newCluster['NumCacheNodes'];
			autoMinorVersionUpgrade = newCluster['AutoMinorVersionUpgrade'];
			cacheParameterGroupName = newCluster['CacheParameterGroupName'];
			engineVersion = newCluster['EngineVersion'];
			notificationTopicArn = newCluster['NotificationTopicArn'];
			port = newCluster['Port'];
			preferredAvailabilityZone = newCluster['PreferredAvailabilityZone'];
			preferredMaintenanceWindow = newCluster['PreferredMaintenanceWindow'];
		}
		
		public function removeClusterResources():Object
		{
			removeParameterGroupFromResources();
			removeSecurityGroupIngresses();
			removeSecurityGroupsFromResources();
			currentTemplate.removeResource(clusterName);
			return currentTemplate.resources;
		}
		
		//If cacheParameterGroup references another resource, remove the resource.
		//Otherwise, parameter group is existing group, so when retrieving 'Ref' fails,
		//catch and return templateResources
		private function removeParameterGroupFromResources():void
		{
			//var currentResources:CloudFormationResources = new CloudFormationResources(templateResources);
			try{
				currentTemplate.removeResource(cacheParameterGroupName['Ref']);				
			}catch(error:Error){
				//Parameter group does not reference another resource
			}
		}
		
		private function removeSecurityGroupsFromResources():void
		{
			for(var index:int; index < cacheSecurityGroupNames.length; index++)
			{
				try{
					currentTemplate.removeResource(cacheSecurityGroupNames[index]['Ref']);
				}catch(error:Error){
					//Security group does not reference another resource
				}				
			}
		}
		
		private function removeSecurityGroupIngresses():void
		{	
			var ingressCollection:ArrayCollection = new ArrayCollection();
			for(var resource:* in currentTemplate.resources)
			{
				if(currentTemplate.resources[resource]['Type'] == "AWS::ElastiCache::SecurityGroupIngress")
				{
					var secGroupName:String;
					try{
						secGroupName = currentTemplate.resources[resource]['Properties']['CacheSecurityGroupName']['Ref'];
					}catch(error:Error){
						secGroupName = currentTemplate.resources[resource]['Properties']['CacheSecurityGroupName'];
					}
						
					for(var index:int; index < cacheSecurityGroupNames.length; index++)
					{
						try{
							if(cacheSecurityGroupNames[index]['Ref'] == secGroupName)
							{
								currentTemplate.removeResource(resource);
							}
						}catch(error:Error){}
					}
				}
			}
		}
	}
}