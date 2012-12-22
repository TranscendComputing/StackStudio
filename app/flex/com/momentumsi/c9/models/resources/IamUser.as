package com.momentumsi.c9.models.resources
{
	import com.momentumsi.c9.constants.ResourceType;
	import com.momentumsi.c9.models.Element;
	import com.momentumsi.c9.models.ProjectVersion;
	
	import flash.events.Event;
	
	import mx.collections.ArrayCollection;
	
	[Bindable]
	public class IamUser extends Element
	{
		public var path:String;
		public var policies:ArrayCollection;
		
		public var metadata:Object;
		public var deletionPolicy:String;
		public var dependsOn:Object;
		
		public function IamUser(element:Element)
		{
			super(element.id, element.name, element.elementType, element.projectId);
			properties = element.properties;
			elementGroup = ELEMENT_GROUP_RESOURCE;
			elementType = ResourceType.IAM_USER;
		}
		private var _properties:Object;
		override public function get properties():Object
		{
			_properties = new Object();
			if(path != null)
			{
				_properties["Path"] = path;
			}
			if(policies != null)
			{
				_properties["Policies"] = policies.toArray();
			}
			
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
				path = value["Path"];
				policies = new ArrayCollection(value["Policies"] as Array);
			}
		}
		
		public function removeUserResources(version:ProjectVersion):void
		{
			removePoliciesFromResources(version);
			removeAccessKeyFromResources(version);
			version.deleteElementByName(name);
		}
		
		private function removePoliciesFromResources(version:ProjectVersion):void
		{
			var checkResource:*;
			//Remove policy resources
			try{
				for each(var resource:Element in version.elements)
				{
					if(resource.elementType == ResourceType.IAM_POLICY)
					{
						for each(checkResource in resource.properties['Properties']['Users'])
						{
							if(checkResource.hasOwnProperty('Ref') && checkResource['Ref'] == name)
							{
								version.deleteElementByName(checkResource);
							}
						}
					}
				}
			}catch(error:Error){
				//Unable to locate policy resource
				trace(error.message);
			}
		}
		
		private function removeAccessKeyFromResources(version:ProjectVersion):void
		{
			//Remove access key resource
			try{
				for each(var resource:Element in version.elements)
				{
					if(resource.elementType == ResourceType.IAM_ACCESS_KEY)
					{
						if(resource.properties['Properties']['UserName'].hasOwnProperty('Ref') && resource.properties['Properties']['UserName']['Ref'] == name)
						{
							version.deleteElementByName(resource.name);
						}
					}
				}
			}catch(error:Error){
				//Unable to locate access key resource
				trace(error.message);
			}
		}
	}
}