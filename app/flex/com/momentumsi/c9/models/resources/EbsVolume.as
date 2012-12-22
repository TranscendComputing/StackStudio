package com.momentumsi.c9.models.resources
{
	import com.momentumsi.c9.models.Element;
	
	public class EbsVolume extends Element
	{
		[Bindable]
		public var availabilityZone:Object;
		[Bindable]
		public var size:Object;
		[Bindable]
		public var snapshotId:Object;
		[Bindable]
		public var tags:Object;
		
		public function EbsVolume(id:String=null, name:String=null, elementType:String=null)
		{
			super(id, name, elementType);
			elementGroup = ELEMENT_GROUP_RESOURCE;
			elementType = ResourceType.EBS_VOLUME;			
		}
		
		override public function get properties():Object
		{
			properties = new Object();
			
			if(size != null)
			{
				properties["Size"] = size;
			}
			if(snapshotId != null)
			{
				properties["SnapshotId"] = snapshotId;
			}
			if(tags != null)
			{
				properties["Tags"] = tags;
			}
			
			properties["AvailabilityZone"] = availabilityZone;
			
			return properties;
		}
	}
}