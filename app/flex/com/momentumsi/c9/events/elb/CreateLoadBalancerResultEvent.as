package com.momentumsi.c9.events.elb
{
	import mx.messaging.messages.IMessage;
	import mx.rpc.AsyncToken;
	import mx.rpc.events.ResultEvent;
	
	public class CreateLoadBalancerResultEvent extends ResultEvent
	{
		public static const RESULT:String = "createLoadBalancerResult";
		
		public function CreateLoadBalancerResultEvent(result:Object=null)
		{
			super(RESULT, false, true, result);
		}
	}
}