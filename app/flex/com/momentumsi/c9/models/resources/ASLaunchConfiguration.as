package com.momentumsi.c9.models.resources
{
	import com.momentumsi.c9.constants.ResourceType;
	import com.momentumsi.c9.models.Element;
	
	[Bindable]
	public class ASLaunchConfiguration extends Element
	{
		public var blockDeviceMappings:Object
		public var imageId:Object
		public var instanceType:Object;
		public var kernelId:Object;
		public var keyName:Object;
		public var ramDiskId:Object;
		public var securityGroups:Array;
		public var userData:Object;
		public var metadata:Object;
		public var deletionPolicy:Object;
		public var dependsOn:Object;
		public var instanceMonitoring:Object;
		
		public function ASLaunchConfiguration(element:Element=null)
		{
			if(element != null)
			{
				super(element.id, element.name, element.elementType, element.projectId);
				properties = element.properties;
			}
			elementGroup = ELEMENT_GROUP_RESOURCE;
			elementType = ResourceType.AS_LAUNCH_CONFIG;			
		}
		
		private var _properties:Object;
		override public function get properties():Object
		{
			_properties = new Object();
			
			if(blockDeviceMappings != null)
			{
				_properties["BlockDeviceMappings"] = blockDeviceMappings;
			}
			if(kernelId != null){
				_properties["KernelId"] = kernelId;
			}
			if(keyName != null){
				_properties["KeyName"] = keyName;
			}

			if(ramDiskId != null){
				_properties["RamDiskId"] = ramDiskId;
			}
			if(securityGroups != null){
				_properties["SecurityGroups"] = securityGroups;
			}

			if(userData != null){
				_properties["UserData"] = userData;
			}
			
			if(instanceMonitoring != null){
				if(instanceMonitoring)
				{
					_properties["InstanceMonitoring"] = "true";
				}else
				{
					_properties["InstanceMonitoring"] = "false";
				}
			}

			_properties["InstanceType"] = instanceType;				
			_properties["ImageId"] = imageId;
			
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
				instanceType = value["InstanceType"];				
				kernelId = value["KernelId"];
				keyName = value["KeyName"];
				ramDiskId = value["RamDiskId"];
				securityGroups = value["SecurityGroups"];
				userData = value["UserData"];
				imageId = value["ImageId"];
				blockDeviceMappings = value["BlockDeviceMappings"];
			}
		}
	}
}