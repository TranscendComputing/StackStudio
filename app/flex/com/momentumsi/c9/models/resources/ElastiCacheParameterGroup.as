package com.momentumsi.c9.models.resources
{
	import com.momentumsi.c9.models.Element;
	
	public class ElastiCacheParameterGroup extends Element
	{
		[Bindable]
		public var cacheParameterGroupFamily:String;
		[Bindable]
		public var description:String;
		[Bindable]
		public var cacheProperties:Object;
		
		public function ElastiCacheParameterGroup(id:String=null, name:String=null, elementType:String=null)
		{
			super(id, name, elementType);
			elementGroup = ELEMENT_GROUP_RESOURCE;
			elementType = "AWS::ElastiCache::ParameterGroup";
		}
		
		override public function get properties():Object
		{
			properties = new Object();
			if(cacheProperties != null)
			{
				properties["Properties"] = cacheProperties;
			}
			properties["CacheParameterGroupFamily"] = cacheParameterGroupFamily;
			properties["Description"] = description;
			
			return properties;
		}
	}
}