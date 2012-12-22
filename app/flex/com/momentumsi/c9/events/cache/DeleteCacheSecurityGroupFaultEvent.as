package com.momentumsi.c9.events.cache
{
	import mx.rpc.Fault;
	import mx.rpc.events.FaultEvent;
	
	public class DeleteCacheSecurityGroupFaultEvent extends FaultEvent
	{
		public static const FAULT:String = "deleteCacheSecurityGroupFault";
		
		public function DeleteCacheSecurityGroupFaultEvent(fault:Fault=null)
		{
			super(FAULT, false, false, fault);
		}
	}
}