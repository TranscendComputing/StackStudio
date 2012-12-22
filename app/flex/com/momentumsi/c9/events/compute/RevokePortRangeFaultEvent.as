package com.momentumsi.c9.events.compute
{
	import mx.rpc.Fault;
	import mx.rpc.events.FaultEvent;
	
	public class RevokePortRangeFaultEvent extends FaultEvent
	{
		public static const FAULT:String = "revokePortRangeFault";
		
		public function RevokePortRangeFaultEvent(fault:Fault=null)
		{
			super(FAULT, false, false, fault);
		}
	}
}