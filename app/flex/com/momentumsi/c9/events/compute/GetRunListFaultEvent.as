package com.momentumsi.c9.events.compute
{
	import mx.rpc.Fault;
	import mx.rpc.events.FaultEvent;
	
	public class GetRunListFaultEvent extends FaultEvent
	{
		public static const FAULT:String = "getRunListFault";
		
		public function GetRunListFaultEvent(fault:Fault=null)
		{
			super(FAULT, false, true, fault);
		}
	}
}