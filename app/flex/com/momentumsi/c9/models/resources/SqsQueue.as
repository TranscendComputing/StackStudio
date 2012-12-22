package com.momentumsi.c9.models.resources
{
	import com.momentumsi.c9.models.Element;
	
	public class SqsQueue extends Element
	{
		[Bindable]
		public var visibilityTimeout:Object;
		
		public function SqsQueue(id:String=null, name:String=null, elementType:String=null)
		{
			super(id, name, elementType);
			elementGroup = ELEMENT_GROUP_RESOURCE;
			elementType = "AWS::SQS:Queue";			
		}
		
		override public function get properties():Object
		{
			properties = new Object();
			if(visibilityTimeout != null)
			{
				properties["VisibilityTimeout"] = visibilityTimeout;
			}
			return properties;
		}
	}
}