package com.momentumsi.c9.models.resources
{
	import com.momentumsi.c9.models.Element;
	
	public class RecordSetGroup extends Element
	{
		[Bindable]
		public var hostedZoneId:String;
		[Bindable]
		public var hostedZoneName:String;
		[Bindable]
		public var recordSets:Array;
		[Bindable]
		public var comment:String;
		
		public function RecordSetGroup(id:String=null, name:String=null, elementType:String=null)
		{
			super(id, name, elementType);
			elementGroup = ELEMENT_GROUP_RESOURCE;
			elementType = "AWS::Route53::RecordSetGroup";
		}
		
		override public function get properties():Object
		{
			properties = new Object();
			
			if(hostedZoneId != null)
			{
				properties["HostedZoneId"] = hostedZoneId;
			}
			if(hostedZoneName != null)
			{
				properties["HostedZoneName"] = hostedZoneName;
			}
			if(comment != null)
			{
				properties["Comment"] = comment;
			}
			properties["RecordSets"] = recordSets;
			
			return properties;
		}
	}
}