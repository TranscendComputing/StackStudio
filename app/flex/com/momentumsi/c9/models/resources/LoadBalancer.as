package com.momentumsi.c9.models.resources
{
	import com.momentumsi.c9.constants.ResourceType;
	import com.momentumsi.c9.models.Element;
	import com.momentumsi.c9.models.ProjectVersion;
	
	[Bindable]
	public class LoadBalancer extends Element
	{
		public var availabilityZones:Object;
		public var healthCheck:Object;
		public var instances:Array;
		public var listeners:Array;
		public var appCookieStickinessPolicy:Object;
		public var lbCookieStickinessPolicy:Object;
		public var securityGroups:Object;
		public var subnets:Object;
		
		public var metadata:Object;
		public var deletionPolicy:String;
		public var dependsOn:Object;
		
		public function LoadBalancer(element:Element)
		{
			super(element.id, element.name, element.elementType, element.projectId);
			elementGroup = ELEMENT_GROUP_RESOURCE;
			elementType = ResourceType.LOAD_BALANCER;
			properties = element.properties;
		}
		
		private var _properties:Object;
		override public function get properties():Object
		{
			_properties = new Object();
			
			if(healthCheck != null)
			{
				_properties["HealthCheck"] = healthCheck;
			}
			if(instances != null)
			{
				_properties["Instances"] = instances;
			}
			if(listeners != null)
			{
				_properties["Listeners"] = listeners;
			}
			if(appCookieStickinessPolicy != null)
			{
				_properties["AppCookieStickinessPolicy"] = appCookieStickinessPolicy;
			}
			if(lbCookieStickinessPolicy != null)
			{
				_properties["LBCookieStickinessPolicy"] = lbCookieStickinessPolicy;
			}
			if(securityGroups != null)
			{
				_properties["SecurityGroups"] = securityGroups;
			}
			if(subnets != null)
			{
				_properties["Subnets"] = subnets;
			}
			_properties["AvailabilityZones"] = availabilityZones;
			
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
				healthCheck = value["HealthCheck"];
				instances = value["Instances"];
				listeners = value["Listeners"];
				appCookieStickinessPolicy = value["AppCookieStickinessPolicy"];
				lbCookieStickinessPolicy = value["LBCookieStickinessPolicy"];
				securityGroups = value["SecurityGroups"];
				subnets = value["Subnets"];
				availabilityZones = value["AvailabilityZones"];
			}
		}
		
		
		public function addLoadBalancerEc2InstanceRef(ec2Instance:Element, version:ProjectVersion):void
		{
			if(instances == null)
			{
				instances = [];
			}						
			instances.push({Ref: ec2Instance.name});
			save(version);
		}
	}
}