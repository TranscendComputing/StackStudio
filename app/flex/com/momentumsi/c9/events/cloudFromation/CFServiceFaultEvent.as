package com.momentumsi.c9.events.cloudFromation
{
	import mx.rpc.Fault;
	import mx.rpc.events.FaultEvent;
	
	public class CFServiceFaultEvent extends FaultEvent
	{
		public static const FAULT:String = "cfServiceFault";
		
		public function CFServiceFaultEvent(fault:Fault=null)
		{
			super(FAULT, false, true, fault);
		}
	}
}