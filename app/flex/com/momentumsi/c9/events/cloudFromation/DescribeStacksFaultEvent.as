package com.momentumsi.c9.events.cloudFromation
{
	import mx.rpc.Fault;
	import mx.rpc.events.FaultEvent;
	
	public class DescribeStacksFaultEvent extends FaultEvent
	{
		public static const FAULT:String = "describeStacksFault";
		
		public function DescribeStacksFaultEvent(fault:Fault=null)
		{
			super(FAULT, false, true, fault);
		}
	}
}