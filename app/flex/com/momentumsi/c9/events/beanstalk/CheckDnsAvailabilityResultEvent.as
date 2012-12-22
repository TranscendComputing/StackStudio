package com.momentumsi.c9.events.beanstalk
{
	import flash.events.Event;

	public class CheckDnsAvailabilityResultEvent extends Event
	{
		public static const RESULT:String = "checkDnsAvailabilityResult";
		
		public var available:Boolean = true; 
		public function CheckDnsAvailabilityResultEvent(result:Object=null)
		{
			super(RESULT, true, true);
			available = Boolean(result.Available);
		}
	}
}