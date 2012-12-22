package com.momentumsi.c9.models.resources
{
	import com.momentumsi.c9.constants.ResourceType;
	import com.momentumsi.c9.models.Element;
	import com.momentumsi.c9.models.ProjectVersion;
	import com.momentumsi.c9.utils.IntrinsicFunctionUtil;
	
	import flash.events.Event;
	
	import mx.collections.ArrayCollection;

	[Bindable]
	public class Ec2Instance extends Element
	{
		public var availabilityZone:Object;
		public var imageId:Object;
		public var instanceType:Object;
		public var disableApiTermination:Object;
		public var kernelId:Object;
		public var keyName:Object;
		public var monitoring:Object;
		public var placementGroupName:Object;
		public var privateIpAddress:Object;
		public var ramDiskId:Object;
		public var securityGroups:Array;
		public var securityGroupIds:Object;
		public var sourceDestCheck:Object;
		public var subnetId:Object;
		public var tags:Object;
		public var userData:Object;
		public var volumes:Object;
		public var description:String;
		
		public var metadata:Object;
		public var deletionPolicy:String;
		public var dependsOn:String;
		
		public function Ec2Instance(element:Element=null)
		{
			if(element != null)
			{
				super(element.id, element.name, element.elementType, element.projectId);
				properties = element.properties;
			}
			elementGroup = ELEMENT_GROUP_RESOURCE;
			elementType = ResourceType.EC2_INSTANCE;
		}
		
		private var _properties:Object;
		override public function get properties():Object
		{	
			_properties = new Object();
			
			if(availabilityZone != null){
				_properties["AvailabilityZone"] = availabilityZone;
			}
			if(instanceType != null){
				_properties["InstanceType"] = instanceType;				
			}
			if(disableApiTermination != null && disableApiTermination != false){
				_properties["DisableApiTermination"] = disableApiTermination;
			}
			if(kernelId != null){
				_properties["KernelId"] = kernelId;
			}
			if(keyName != null){
				_properties["KeyName"] = keyName;
			}
			if(monitoring != null){
				if(monitoring)
				{
					_properties["Monitoring"] = "true";
				}else
				{
					_properties["Monitoring"] = "false";
				}
			}
			if(placementGroupName != null){
				_properties["PlacementGroupName"] = placementGroupName;
			}
			if(privateIpAddress != null){
				_properties["PrivateIpAddress"] = privateIpAddress;
			}
			if(ramDiskId != null){
				_properties["RamDiskId"] = ramDiskId;
			}
			if(securityGroups != null){
				_properties["SecurityGroups"] = securityGroups;
			}
			if(securityGroupIds != null){
				_properties["SecurityGroupIds"] = securityGroupIds;
			}
			if(sourceDestCheck != null){
				_properties["SourceDestCheck"] = sourceDestCheck;
			}
			if(subnetId != null){
				_properties["SubnetId"] = subnetId;
			}
			if(tags != null){
				_properties["Tags"] = tags;
			}
			if(userData != null){
				_properties["UserData"] = userData;
			}
			if(volumes != null){
				_properties["Volumes"] = volumes;
			}
			_properties["ImageId"] = imageId;
			
			var props:Object = _properties;
			_properties = new Object();
			_properties["Properties"] = props;
			
			if(metadata != null)
			{
				_properties["Metadata"] = metadata;
				if(description != null)
				{
					_properties["Metadata"]["Comment"] = description;
				}
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
				availabilityZone = value["AvailabilityZone"];
				instanceType = value["InstanceType"];				
				disableApiTermination = value["DisableApiTermination"];
				kernelId = value["KernelId"];
				keyName = value["KeyName"];
				monitoring = value["Monitoring"];
				placementGroupName = value["PlacementGroupName"];
				privateIpAddress = value["PrivateIpAddress"];
				ramDiskId = value["RamDiskId"];
				securityGroups = value["SecurityGroups"];
				securityGroupIds = value["SecurityGroupIds"];
				sourceDestCheck = value["SourceDestCheck"];
				subnetId = value["SubnetId"];
				tags = value["Tags"];
				userData = value["UserData"];
				volumes = value["Volumes"];
				imageId = value["ImageId"];
			}
		}
		
		public function removeInstanceResources(version:ProjectVersion):void
		{
			removeEIPReferences(version);
			version.deleteElementByName(name);
		}
		
		private function removeEIPReferences(version:ProjectVersion):void
		{
			version.deleteElementByReference("AWS::EC2::EIP", "InstanceId", name);
			version.dispatchEvent(new Event(ProjectVersion.REFRESH));
		}
		
		public function addSecurityGroupEc2InstanceRef(securityGroupElement:Element, version:ProjectVersion):void
		{
			if(securityGroups == null)
			{
				securityGroups = [];
			}						
			securityGroups.push({Ref: securityGroupElement.name});
			save(version);
		}
	}
}