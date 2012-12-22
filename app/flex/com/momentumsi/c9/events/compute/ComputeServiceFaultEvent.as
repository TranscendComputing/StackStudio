package com.momentumsi.c9.events.compute
{
	import mx.rpc.Fault;
	import mx.rpc.events.FaultEvent;
	
	public class ComputeServiceFaultEvent extends FaultEvent
	{
		public static const FAULT:String = "computeServiceFault";
		
		public function ComputeServiceFaultEvent(fault:Fault=null)
		{
			super(FAULT, false, true, fault);
		}
	}
}