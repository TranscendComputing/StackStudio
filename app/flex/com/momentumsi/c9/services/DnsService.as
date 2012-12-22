package com.momentumsi.c9.services
{	
	import com.momentumsi.c9.events.dns.CreateHostedZoneResultEvent;
	import com.momentumsi.c9.events.dns.DnsServiceFaultEvent;
	
	import mx.collections.ArrayCollection;
	import mx.rpc.events.FaultEvent;
	import mx.rpc.events.ResultEvent;

	[Event(name="createHostedZoneResult", type="com.momentumsi.c9.events.dns.CreateHostedZoneResultEvent")]
	
	[Event(name="dnsServiceFault", type="com.momentumsi.c9.events.dns.DnsServiceFaultEvent")]
	[Bindable]
	public class DnsService extends CloudApiService
	{
		
		//Value objects
		public var dnsPrices:ArrayCollection;
		
		//Action Constants
		public static const CREATE_HOSTED_ZONE:String = "create_hosted_zone";
		public static const GET_DNS_PRICES:String = "get_dns_prices";

		public function DnsService(rootURL:String=null, destination:String=null)
		{
			super(rootURL, destination);
			serviceType = DNS_SERVICE;
		}
		
		//Action requests
		
		public function createHostedZone(name:String, comment:String):void
		{
			setPost();
			action = CREATE_HOSTED_ZONE;
			request = {name: name, comment: comment};
			addEventListener(ResultEvent.RESULT, createHostedZone_resultHandler);
			addEventListener(FaultEvent.FAULT, default_faultHandler);
			send();
		}
		
		public function getDnsPrices():void
		{
			setPost();
			action = GET_DNS_PRICES;
			addEventListener(ResultEvent.RESULT, getDnsPrices_resultHandler);
			addEventListener(FaultEvent.FAULT, default_faultHandler);
			send();
		}

		
		/**********************
		 *   Result Handlers
		 * ********************/
		
		private function createHostedZone_resultHandler(event:ResultEvent):void
		{
			removeEventListener(FaultEvent.FAULT, default_faultHandler);
			removeEventListener(ResultEvent.RESULT, createHostedZone_resultHandler);
			dispatchEvent(new CreateHostedZoneResultEvent(result));
		}
		
		private function getDnsPrices_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, getDnsPrices_resultHandler);
			removeEventListener(FaultEvent.FAULT, default_faultHandler);
			dnsPrices = new ArrayCollection(result as Array);
		}
		

		
		/**********************
		 *   Fault Handlers
		 * ********************/
		
		private function default_faultHandler(event:FaultEvent):void
		{
			removeEventListener(FaultEvent.FAULT, default_faultHandler);
			dispatchEvent(new DnsServiceFaultEvent(event.fault));
		}
	}
}
