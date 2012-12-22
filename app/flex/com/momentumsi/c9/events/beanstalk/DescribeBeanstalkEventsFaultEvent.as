package com.momentumsi.c9.events.beanstalk
{
	import mx.rpc.Fault;
	import mx.rpc.events.FaultEvent;
	
	public class DescribeBeanstalkEventsFaultEvent extends FaultEvent
	{
		public static const FAULT:String = "describeBeanstalkEventsFault"
			
		public function DescribeBeanstalkEventsFaultEvent(fault:Fault=null)
		{
			super(FAULT, false, false, fault);
		}
	}
}