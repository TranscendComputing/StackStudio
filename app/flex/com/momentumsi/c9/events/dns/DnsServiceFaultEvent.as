package com.momentumsi.c9.events.dns
{
	import mx.rpc.Fault;
	import mx.rpc.events.FaultEvent;
	
	public class DnsServiceFaultEvent extends FaultEvent
	{
		public static const FAULT:String = "dnsServiceFault";
		
		public function DnsServiceFaultEvent(fault:Fault=null)
		{
			super(FAULT, false, true, fault);
		}
	}
}