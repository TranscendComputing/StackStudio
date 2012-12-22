package com.momentumsi.c9.events.rds
{
	import mx.messaging.messages.IMessage;
	import mx.rpc.AsyncToken;
	import mx.rpc.events.ResultEvent;
	
	public class AuthorizeIngressResultEvent extends ResultEvent
	{
		public static const INGRESS_AUTHORIZED:String = "dbSecurityGroupAuthorized";
		
		public function AuthorizeIngressResultEvent(result:Object=null)
		{
			super(INGRESS_AUTHORIZED, false, false, result);
		}
	}
}