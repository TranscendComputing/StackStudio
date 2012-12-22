package com.momentumsi.c9.events.cloudFromation
{
	import com.maccherone.json.JSON;
	
	import mx.rpc.Fault;
	import mx.rpc.events.FaultEvent;
	
	public class DescribeStackEventsFaultEvent extends FaultEvent
	{
		public static const FAULT:String = "describeStackEventsFault";
		
		public function DescribeStackEventsFaultEvent(fault:Fault=null)
		{
			super(FAULT, false, false, fault);
		}
	}
}