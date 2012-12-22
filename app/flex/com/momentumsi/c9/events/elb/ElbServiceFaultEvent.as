package com.momentumsi.c9.events.elb
{
	import mx.rpc.Fault;
	import mx.rpc.events.FaultEvent;
	
	public class ElbServiceFaultEvent extends FaultEvent
	{
		public static const FAULT:String = "elbServiceFault";
		
		public function ElbServiceFaultEvent(fault:Fault=null)
		{
			super(FAULT, false, true, fault);
		}
	}
}