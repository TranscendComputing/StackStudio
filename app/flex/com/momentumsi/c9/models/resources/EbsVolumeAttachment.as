package com.momentumsi.c9.models.resources
{
	import com.momentumsi.c9.models.Element;
	
	public class EbsVolumeAttachment extends Element
	{
		[Bindable]
		public var instanceId:Object;
		[Bindable]
		public var volumeId:Object;
		[Bindable]
		public var device:Object;
		
		public function EbsVolumeAttachment(id:String=null, name:String=null, elementType:String=null)
		{
			super(id, name, elementType);
			elementGroup = ELEMENT_GROUP_RESOURCE;
			elementType = "AWS::EC2""VolumeAttachment";
		}
		
		override public function get properties():Object
		{
			properties = new Object();
			properties["InstanceId"] = instanceId;
			properties["VolumeId"] = volumeId;
			properties["Device"] = device;
			return properties;			
		}
	}
}