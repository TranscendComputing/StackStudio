package com.momentumsi.c9.models.resources
{
	import com.momentumsi.c9.models.Element;
	
	public class ElastiCacheSecurityGroup extends Element
	{
		[Bindable]
		public var description:String;
		
		public function ElastiCacheSecurityGroup(id:String=null, name:String=null, elementType:String=null)
		{
			super(id, name, elementType);
		}
		
		override public function get properties():Object
		{
			properties = new Object();
			properties["Description"] = description;
			return properties;
		}
		
	}
}