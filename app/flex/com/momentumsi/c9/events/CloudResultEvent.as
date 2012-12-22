package com.momentumsi.c9.events
{
	import mx.messaging.messages.IMessage;
	import mx.rpc.AsyncToken;
	import mx.rpc.events.ResultEvent;
	
	public class CloudResultEvent extends ResultEvent
	{
		public static const SERVICE_ADDED:String = "serviceAdded";
		public static const SERVICE_REMOVED:String = "serviceRemoved";
		public function CloudResultEvent(type:String, bubbles:Boolean=false, cancelable:Boolean=true, result:Object=null, token:AsyncToken=null, message:IMessage=null)
		{
			super(type, bubbles, cancelable, result, token, message);
		}
	}
}