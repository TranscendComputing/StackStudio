package com.momentumsi.c9.models.aws_types
{
	import com.momentumsi.c9.representers.RepresenterBase;
	import com.momentumsi.c9.utils.Helpers;
	
	[Bindable]
	public class BlockDeviceMapping extends RepresenterBase
	{
		public function BlockDeviceMapping(data:Object)
		{
			super(data);
		}
		
		public function get deviceName():String 
		{
			return data.device_name;
		}
		
		public function get volumeId():String 
		{
			return data.volumeId;
		}
		
		public function get volumeSize():Number
		{
			return data.volumeSize;
		}
		
		public function get status():String 
		{
			return data.status;
		}
		
		public function get attachedAt():String 
		{			
			return dateFormatter.format(Helpers.formatDate(data.attachTime));
		}
		
		public function get deleteOnTermination():Boolean 
		{
			return Boolean(data.deleteOnTermination);
		}
	}
}