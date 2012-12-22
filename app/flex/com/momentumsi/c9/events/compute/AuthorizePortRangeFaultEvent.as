package com.momentumsi.c9.events.compute
{
	import mx.rpc.Fault;
	import mx.rpc.events.FaultEvent;
	
	public class AuthorizePortRangeFaultEvent extends FaultEvent
	{
		public static const FAULT:String = "authorizePortRangeFault";
		
		public function AuthorizePortRangeFaultEvent(fault:Fault=null)
		{
			super(FAULT, false, false, fault);
		}
	}
}