package com.momentumsi.c9.events.beanstalk
{
	import mx.rpc.Fault;
	import mx.rpc.events.FaultEvent;
	
	public class DescribeEnvironmentsFaultEvent extends FaultEvent
	{
		public static const FAULT:String = "describeEnvironmentsFault"
			
		public function DescribeEnvironmentsFaultEvent(fault:Fault=null)
		{
			super(FAULT, false, false, fault);
		}
	}
}