package com.momentumsi.c9.events.rds
{
	import mx.rpc.Fault;
	import mx.rpc.events.FaultEvent;
	
	public class DescribeDbSecurityGroupsFaultEvent extends FaultEvent
	{
		public static const FAULT:String = "describeDbGroupsFault";
		public function DescribeDbSecurityGroupsFaultEvent(fault:Fault=null)
		{
			super(FAULT, false, false, fault);
		}
	}
}