package com.momentumsi.c9.models.resources
{
	import com.momentumsi.c9.models.Element;
	
	public class SnsTopicPolicy extends Element
	{
		[Bindable]
		public var policyDocument:Object;
		[Bindable]
		public var topics:Array;
		
		public function SnsTopicPolicy(id:String=null, name:String=null, elementType:String=null)
		{
			super(id, name, elementType);
			elementGroup = ELEMENT_GROUP_RESOURCE;
			elementType = "AWS::SNS::TopicPolicy";	
		}
		
		override public function get properties():Object
		{
			properties = new Object();
			
			properties["PolicyDocument"] = policyDocument;
			properties["Topics"] = topics;
			
			return properties;
		}
	}
}