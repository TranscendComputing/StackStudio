package com.momentumsi.c9.models.resources
{
	import com.momentumsi.c9.models.Element;
	
	public class SqsQueuePolicy extends Element
	{
		[Bindable]
		public var policyDocument:Object;
		[Bindable]
		public var queues:Array;
		
		public function SqsQueuePolicy(id:String=null, name:String=null, elementType:String=null)
		{
			super(id, name, elementType);
			elementGroup = ELEMENT_GROUP_RESOURCE;
			elementType = "AWS::SQS:QueuePolicy";
		}
		
		override public function get properties():Object
		{
			properties = new Object();
			properties["PolicyDocument"] = policyDocument;
			properties["Queues"] = queues;
			return properties;
		}
	}
}