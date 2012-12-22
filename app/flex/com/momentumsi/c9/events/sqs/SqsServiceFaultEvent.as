package com.momentumsi.c9.events.sqs
{
	import mx.rpc.Fault;
	import mx.rpc.events.FaultEvent;
	
	public class SqsServiceFaultEvent extends FaultEvent
	{
		public static const FAULT:String = "sqsServiceFault";
		
		public function SqsServiceFaultEvent(fault:Fault=null)
		{
			super(FAULT, false, true, fault);
		}
	}
}