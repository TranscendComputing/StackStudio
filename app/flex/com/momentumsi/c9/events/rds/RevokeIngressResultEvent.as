package com.momentumsi.c9.events.rds
{
	import mx.messaging.messages.IMessage;
	import mx.rpc.AsyncToken;
	import mx.rpc.events.ResultEvent;
	
	public class RevokeIngressResultEvent extends ResultEvent
	{
		public static const INGRESS_REVOKED:String = "dbSecurityGroupRevoked";
		
		public function RevokeIngressResultEvent(result:Object=null)
		{
			super(INGRESS_REVOKED, false, false, result);
		}
	}
}