package com.momentumsi.c9.models
{

	public class ResourceElement extends Element
	{
		protected var _metadata:Object;
		protected var _deletionPolicy:String;
		protected var _dependsOn:Object;
		protected var _resourceProperties:Object = new Object();
		
		public function ResourceElement(element:Element=null)
		{
			if(element != null)
			{
				super(element.id, element.name, element.elementType, element.projectId);
				_resourceProperties = element.properties.Properties;
				_metadata = element.properties.Metadata;
				_deletionPolicy = element.properties.DeletionPolicy;
				_dependsOn = element.properties.DependsOn;
			}
			elementGroup = ELEMENT_GROUP_RESOURCE;
		}
		
		override public function get properties():Object
		{
			var resourceObject:Object = new Object();
			resourceObject.Type = elementType;
			resourceObject.Properties = attributes;
			if(_metadata)
			{
				resourceObject.Metadata = _metadata;
			}
			if(_dependsOn)
			{
				resourceObject.DependsOn = _dependsOn;				
			}
			if(_deletionPolicy)
			{
				resourceObject.DeletionPolicy = _deletionPolicy;
			}
			
			return resourceObject;
		}
		
		public function get attributes():Object
		{
			//Override in resource element classes
			return new Object();
		}
	}
}