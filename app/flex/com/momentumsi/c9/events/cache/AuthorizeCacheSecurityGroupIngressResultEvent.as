package com.momentumsi.c9.events.cache
{
	import mx.messaging.messages.IMessage;
	import mx.rpc.AsyncToken;
	import mx.rpc.events.ResultEvent;
	
	public class AuthorizeCacheSecurityGroupIngressResultEvent extends ResultEvent
	{
		public static const RESULT:String = "authorizeCacheSecurityGroupIngressResult";
		
		public function AuthorizeCacheSecurityGroupIngressResultEvent(result:Object=null)
		{
			super(RESULT, false, false, result);
		}
	}
}