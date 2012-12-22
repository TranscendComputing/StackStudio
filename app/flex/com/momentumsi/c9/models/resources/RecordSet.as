package com.momentumsi.c9.models.resources
{
	import com.momentumsi.c9.models.Element;
	
	public class RecordSet extends Element
	{
		[Bindable]
		public var hostedZoneId:String;
		[Bindable]
		public var hostedZoneName:String;
		[Bindable]
		public var name:Object;
		[Bindable]
		public var type:Object;
		[Bindable]
		public var ttl:Object;
		[Bindable]
		public var resourceRecords:Object;
		[Bindable]
		public var weight:Object;
		[Bindable]
		public var setIdentifier:Object;
		[Bindable]
		public var aliasTarget:Object;
		[Bindable]
		public var comment:String;
		
		public function RecordSet(id:String=null, name:String=null, elementType:String=null)
		{
			super(id, name, elementType);
			elementGroup = ELEMENT_GROUP_RESOURCE;
			elementType = ResourceType.RECORD_SET;
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
			if(weight != null)
			{
				properties["Weight"] = weight;
			}
			if(setIdentifier != null)
			{
				properties["SetIdentifier"] = setIdentifier;
			}
			if(aliasTarget != null)
			{
				properties["AliasTarget"] = aliasTarget;
			}
			if(comment != null)
			{
				properties["Comment"] = comment;
			}
				
			properties["Name"] = name;
			properties["Type"] = type;
			properties["ResourceRecords"] = resourceRecords;
			
			return properties;
		}
		
	}
}