package com.momentumsi.c9.events.compute
{
	import mx.rpc.Fault;
	import mx.rpc.events.FaultEvent;
	
	public class GetConsoleOutputFaultEvent extends FaultEvent
	{
		public static const FAULT:String = "getConsoleOutputFault";
		
		public function GetConsoleOutputFaultEvent(fault:Fault=null)
		{
			super(FAULT, false, true, fault);
		}
	}
}