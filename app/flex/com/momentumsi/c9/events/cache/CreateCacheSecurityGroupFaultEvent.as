package com.momentumsi.c9.events.cache
{
	import mx.rpc.Fault;
	import mx.rpc.events.FaultEvent;
	
	public class CreateCacheSecurityGroupFaultEvent extends FaultEvent
	{
		public static const FAULT:String = "createCacheSecurityGroupFault";
		
		public function CreateCacheSecurityGroupFaultEvent(fault:Fault=null)
		{
			super(FAULT, false, false, fault);
		}
	}
}