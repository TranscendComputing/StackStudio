package com.momentumsi.c9.events.compute
{
	import mx.rpc.Fault;
	import mx.rpc.events.FaultEvent;
	
	public class StartInstanceFaultEvent extends FaultEvent
	{
		public static const FAULT:String = "startInstanceFault";
		
		public function StartInstanceFaultEvent(fault:Fault=null)
		{
			super(FAULT, false, true, fault);
		}
	}
}