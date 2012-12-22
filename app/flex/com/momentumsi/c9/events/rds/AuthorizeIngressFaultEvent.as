package com.momentumsi.c9.events.rds
{
	import mx.messaging.messages.IMessage;
	import mx.rpc.AsyncToken;
	import mx.rpc.Fault;
	import mx.rpc.events.FaultEvent;
	
	public class AuthorizeIngressFaultEvent extends FaultEvent
	{
		public static const AUTH_FAILED:String = "authorizeRdsSecGrpIngressFailed";
		
		public function AuthorizeIngressFaultEvent(fault:Fault=null)
		{
			super(AUTH_FAILED, false, false, fault);
		}
	}
}