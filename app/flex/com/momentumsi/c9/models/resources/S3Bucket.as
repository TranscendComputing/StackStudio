package com.momentumsi.c9.models.resources
{
	import com.momentumsi.c9.models.Element;
	
	public class S3Bucket extends Element
	{
		[Bindable]
		public var accessControl;
		[Bindable]
		public var websiteConfiguration:Object;
		
		public function S3Bucket(id:String=null, name:String=null, elementType:String=null)
		{
			super(id, name, elementType);
			elementGroup = ELEMENT_GROUP_RESOURCE;
			elementType = ResourceType.S3_BUCKET;
		}
		
		override public function get properties():Object
		{
			properties = new Object();
			
			if(accessControl != null)	
			{
				properties["AccessControl"] = accessControl;
			}
			if(websiteConfiguration != null)
			{
				properties["WebsiteConfiguration"] = websiteConfiguration;
			}
			
			return properties;
		}
	}
}