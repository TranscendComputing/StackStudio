package com.momentumsi.c9.events
{
	import flash.events.Event;
	
	public class ConfigManagerEvent extends Event
	{
		public static const COMPLETE:String = "Complete";
		public static const FAULT:String = "Fault";
		
		public var data:Object;
				
		public function ConfigManagerEvent(type:String, bubbles:Boolean=false, cancelable:Boolean=false)
		{
			super(type, bubbles, cancelable);
		}
	}
}