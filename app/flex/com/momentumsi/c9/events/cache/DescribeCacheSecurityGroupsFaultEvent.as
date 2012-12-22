package com.momentumsi.c9.events.cache
{
	import mx.messaging.messages.IMessage;
	import mx.rpc.AsyncToken;
	import mx.rpc.Fault;
	import mx.rpc.events.FaultEvent;
	
	public class DescribeCacheSecurityGroupsFaultEvent extends FaultEvent
	{
		public static const FAULT:String = "describeCacheSecurityGroupsFault";
		
		public function DescribeCacheSecurityGroupsFaultEvent(fault:Fault=null)
		{
			super(FAULT, false, false, fault);
		}
	}
}