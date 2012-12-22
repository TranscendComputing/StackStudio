package com.momentumsi.c9.events.compute
{
	import mx.rpc.Fault;
	import mx.rpc.events.FaultEvent;
	
	public class StopInstanceFaultEvent extends FaultEvent
	{
		public static const FAULT:String = "stopInstanceFault";
		
		public function StopInstanceFaultEvent(fault:Fault=null)
		{
			super(FAULT, false, true, fault);
		}
	}
}