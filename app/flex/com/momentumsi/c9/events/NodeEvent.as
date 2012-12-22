package com.momentumsi.c9.events
{
	import flash.events.Event;
	
	public class NodeEvent extends Event
	{
		public static const ADD:String = "addNode";
		public static const UPDATE:String = "updateNode";
		
		public function NodeEvent(type:String, bubbles:Boolean=false, cancelable:Boolean=false)
		{
			super(type, bubbles, cancelable);
		}
	}
}