package com.momentumsi.c9.events.cache
{
	import mx.rpc.Fault;
	import mx.rpc.events.FaultEvent;
	
	public class RevokeCacheSecurityGroupIngressFaultEvent extends FaultEvent
	{
		public static const FAULT:String = "revokeCacheSecurityGroupIngressFault";
		
		public function RevokeCacheSecurityGroupIngressFaultEvent(fault:Fault=null)
		{
			super(FAULT, false, false, fault);
		}
	}
}