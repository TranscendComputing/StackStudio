package com.momentumsi.c9.events
{
	import com.momentumsi.c9.models.CloudAccount;
	
	import flash.events.Event;
	
	[Bindable]
	public class CloudAccountSetEvent extends Event
	{
		public static const SET:String = "cloudAccountSet";
		public var provider:String;
		
		public function CloudAccountSetEvent(cloudAccount:CloudAccount)
		{
			this.provider = cloudAccount.cloud_provider;
			super(SET);
		}
	}
}