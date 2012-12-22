package com.momentumsi.c9.events.compute
{
	import mx.rpc.Fault;
	import mx.rpc.events.FaultEvent;
	
	public class GetResourcesFaultEvent extends FaultEvent
	{
		public static const FAULT:String = "getResourcesFault";
		
		public function GetResourcesFaultEvent(fault:Fault=null)
		{
			super(FAULT, false, true, fault);
		}
	}
}