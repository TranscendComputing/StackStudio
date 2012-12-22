package com.momentumsi.c9.events.project
{
	import mx.rpc.Fault;
	import mx.rpc.events.FaultEvent;
	
	public class PromoteEnvironmentFaultEvent extends FaultEvent
	{
		public static const FAULT:String = "promoteEnvironmentFault";
		
		public function PromoteEnvironmentFaultEvent(fault:Fault=null)
		{
			super(FAULT, true, true, fault);
		}
	}
}