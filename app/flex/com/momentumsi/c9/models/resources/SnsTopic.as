package com.momentumsi.c9.models.resources
{
	import com.momentumsi.c9.models.Element;
	
	public class SnsTopic extends Element
	{
		[Bindable]
		public var subscription:Array;
		
		public function SnsTopic(id:String=null, name:String=null, elementType:String=null)
		{
			super(id, name, elementType);
			elementGroup = ELEMENT_GROUP_RESOURCE;
			elementType = ResourceType.SNS_TOPIC;
		}
		
		override public function get properties():Object
		{
			properties = new Object();
			if(subscription != null)
			{
				properties["Subscription"] = subscription;
			}
			return properties;
		}
	}
}