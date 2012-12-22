package com.momentumsi.c9.events
{
	import flash.events.Event;
	
	public class CloudResourceCreateEvent extends Event
	{
		public static const CREATED:String = "cloudResourceCreated";
		public var resource:Object;
		
		public function CloudResourceCreateEvent(resource:Object=null)
		{
			this.resource = resource;
			super(CREATED, false, true);
		}
	}
}