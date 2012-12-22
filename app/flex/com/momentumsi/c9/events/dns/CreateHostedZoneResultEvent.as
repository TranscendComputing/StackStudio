package com.momentumsi.c9.events.dns
{
	import mx.messaging.messages.IMessage;
	import mx.rpc.AsyncToken;
	import mx.rpc.events.ResultEvent;
	
	public class CreateHostedZoneResultEvent extends ResultEvent
	{
		public static const RESULT:String = "createHostedZoneResult";
		
		public function CreateHostedZoneResultEvent(result:Object=null)
		{
			super(RESULT, false, true, result);
		}
	}
}