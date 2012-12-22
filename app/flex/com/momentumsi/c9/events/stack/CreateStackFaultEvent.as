package com.momentumsi.c9.events.stack
{
	import mx.rpc.Fault;
	import mx.rpc.events.FaultEvent;
	
	public class CreateStackFaultEvent extends FaultEvent
	{
		public static const FAULT:String = "createStackFault";
		
		public function CreateStackFaultEvent(fault:Fault=null)
		{
			super(FAULT, false, false, fault);
		}
	}
}