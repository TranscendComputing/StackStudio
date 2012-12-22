package com.momentumsi.c9.events.cache
{
	import mx.rpc.Fault;
	import mx.rpc.events.FaultEvent;
	
	public class AuthorizeCacheSecurityGroupIngressFaultEvent extends FaultEvent
	{
		public static const FAULT:String = "authorizeCacheSecurityGroupIngressFault";
		
		public function AuthorizeCacheSecurityGroupIngressFaultEvent(fault:Fault=null)
		{
			super(FAULT, false, false, fault);
		}
	}
}