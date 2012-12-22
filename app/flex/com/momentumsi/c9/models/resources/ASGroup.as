package com.momentumsi.c9.models.resources
{
	import com.momentumsi.c9.constants.ResourceType;
	import com.momentumsi.c9.models.Element;
	import com.momentumsi.c9.models.ProjectVersion;
	
	import flash.events.Event;
	
	[Bindable]
	public class ASGroup extends Element
	{
		public var availabilityZones:Object;
		public var cooldown:Object;
		public var desiredCapacity:Object;
		public var healthCheckGracePeriod:Object;
		public var healthCheckType:Object;
		public var launchConfigurationName:Object;
		public var loadBalancerNames:Array;
		public var maxSize:Object;
		public var minSize:Object;
		public var notificationConfiguration:Object;
		public var tags:Object;
		public var vpcZoneIdentifier:Object;
		
		public var metadata:Object;
		public var deletionPolicy:String;
		public var dependsOn:Object;
		
		private var _properties:Object;

		public function ASGroup(element:Element=null)
		{
			if(element)
			{
				super(element.id, element.name, element.elementType, element.projectId);
				properties = element.properties;
			}
			elementGroup = ELEMENT_GROUP_RESOURCE;
			elementType = ResourceType.AS_GROUP;
		}
		
		override public function get properties():Object
		{
			_properties = new Object();

			if(cooldown != null)
			{
				_properties["Cooldown"] = cooldown;
			}
			if(desiredCapacity != null)
			{
				_properties["DesiredCapacity"] = desiredCapacity;
			}
			if(healthCheckGracePeriod != null)
			{
				_properties["HealthCheckGracePeriod"] = healthCheckGracePeriod;
			}
			if(healthCheckType != null)
			{
				_properties["HealthCheckType"] = healthCheckType;
			}
			if(loadBalancerNames != null)
			{
				_properties["LoadBalancerNames"] = loadBalancerNames;
			}
			if(notificationConfiguration != null)
			{
				_properties["NotificationConfiguration"] = notificationConfiguration;
			}
			if(tags != null)
			{
				_properties["Tags"] = tags;
			}
			if(vpcZoneIdentifier != null)
			{
				_properties["VPCZoneIdentifier"] = vpcZoneIdentifier;
			}
			
			_properties["AvailabilityZones"] = availabilityZones;
			_properties["LaunchConfigurationName"] = launchConfigurationName;
			_properties["MaxSize"] = maxSize;
			_properties["MinSize"] = minSize;
			
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
			if(value != null){
				availabilityZones = value["AvailabilityZones"];
				cooldown = value["Cooldown"];
				desiredCapacity = value["DesiredCapacity"];
				healthCheckGracePeriod = value["HealthCheckGracePeriod"];
				healthCheckType = value["HealthCheckType"];
				launchConfigurationName = value["LaunchConfigurationName"];
				loadBalancerNames = value["LoadBalancerNames"];
				maxSize = value ["MaxSize"];
				minSize = value["MinSize"];
				notificationConfiguration = value["NotificationConfiguration"]
				tags = value["Tags"];
				vpcZoneIdentifier = value["VPCZoneIdentifier"];
			}

			_properties = value;
		}
		
		public function addAutoScaleGroupLoadBalancerRef(loadBalancer:Element, version:ProjectVersion):void
		{
			if(loadBalancerNames == null)
			{
				loadBalancerNames = [];
			}						
			loadBalancerNames.push({Ref: loadBalancer.name});
			save(version);
		}
		
		public function addSecurityGroupLaunchConfigRef(securityGroupElement:Element, version:ProjectVersion):void
		{
			for each(var projElement:Element in version.elements)
			{
				if(projElement.name == launchConfigurationName["Ref"])
				{
					if(projElement.properties['Properties']['SecurityGroups'] == null)
					{
						projElement.properties['Properties']['SecurityGroups'] = [];
					}
					projElement.properties['Properties']['SecurityGroups'].push({Ref: securityGroupElement.name});
					projElement.save(version);
					break;
				}											
			}
		}
		
		public function removeASGroupResources(version:ProjectVersion):void
		{
			removeLaunchConfig(version);
			removeASTrigger(version);
			removeASPolicy(version);
			version.deleteElementByName(name);
		}
		
		private function removeLaunchConfig(version:ProjectVersion):void
		{
			//First, remove any mappings associated with launch config
			var launchConfigResourceName:String = launchConfigurationName['Ref'];
			var launchConfig:Element = version.getElementByName(launchConfigResourceName);
			launchConfig.removeMappings(version);
			
			//Remove Auto Scale Group launch configuration resource
			version.deleteElementByName(launchConfigResourceName);
		}
		
		private function removeASTrigger(version:ProjectVersion):void
		{
			//Remove Auto Scale Group trigger resource							
			for each(var resource:Element in version.elements){
				if(resource.elementType == ResourceType.AS_TRIGGER){
					if(resource.properties['Properties']['AutoScalingGroupName']['Ref'] == name)
					{
						version.deleteElementByName(resource.name);
						return;
					}
				}
			}
		}
		
		private function removeASPolicy(version:ProjectVersion):void
		{
			//Remove Auto Scale Group scaling policy resource(s)
			for each(var resource:Element in version.elements){
				if(resource.elementType == ResourceType.AS_TRIGGER){
					if(resource.properties['Properties']['AutoScalingGroupName']['Ref'] == name)
					{
						version.deleteElementByName(resource.name);
						return;
					}
				}
			}
		}
	}
}