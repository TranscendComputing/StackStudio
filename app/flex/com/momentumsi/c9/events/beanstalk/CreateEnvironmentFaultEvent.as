package com.momentumsi.c9.events.beanstalk
{
	import mx.rpc.Fault;
	import mx.rpc.events.FaultEvent;
	
	public class CreateEnvironmentFaultEvent extends FaultEvent
	{
		public static const FAULT:String = "createEnvironmentFault"
			
		public function CreateEnvironmentFaultEvent(fault:Fault=null)
		{
			super(FAULT, false, false, fault);
		}
	}
}