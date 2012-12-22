package com.momentumsi.c9.events.rds
{
	import mx.messaging.messages.IMessage;
	import mx.rpc.AsyncToken;
	import mx.rpc.Fault;
	import mx.rpc.events.FaultEvent;
	
	public class RevokeIngressFaultEvent extends FaultEvent
	{
		public static const REVOKE_FAILED:String = "revokeRdsSecGrpIngressFailed";
		
		public function RevokeIngressFaultEvent(fault:Fault=null)
		{
			super(REVOKE_FAILED, false, false, fault);
		}
	}
}