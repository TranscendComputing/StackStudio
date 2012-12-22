package com.momentumsi.c9.services
{
	import com.momentumsi.c9.events.elb.CreateLoadBalancerResultEvent;
	import com.momentumsi.c9.events.elb.ElbServiceFaultEvent;
	
	import flash.events.Event;
	
	import mx.collections.ArrayCollection;
	import mx.rpc.events.FaultEvent;
	import mx.rpc.events.ResultEvent;

	[Event(name="createLoadBalancerResult", type="com.momentumsi.c9.events.elb.CreateLoadBalancerResultEvent")]
	[Event(name="elbServiceFault", type="com.momentumsi.c9.events.elb.ElbServiceFaultEvent")]
	public class ElbService extends CloudApiService
	{
		public static const CREATE_LOAD_BALANCER:String = "create_load_balancer";
		public static const CONFIGURE_HEALTH_CHECK:String = "configure_health_check";
		public static const CREATE_LB_STICKINESS_POLICY:String = "create_lb_cookie_stickiness_policy";
		public static const CREATE_APP_STICKINESS_POLICY:String = "create_app_cookie_stickiness_policy";
		public static const GET_PRICES:String = "get_elb_prices";
		
		public var prices:ArrayCollection = new ArrayCollection();
		
		public function ElbService(rootURL:String=null, destination:String=null)
		{
			super(rootURL, destination);
			serviceType = ELB_SERVICE;
		}
				
		public function getElbPrices():void
		{
			action = GET_PRICES;
			addEventListener(ResultEvent.RESULT, getElbPrices_resultHandler);
			send();
		}
		
		public function createLoadBalancer(parameters:Object):void
		{
			setPost();
			action = CREATE_LOAD_BALANCER;
			request = parameters;
			addEventListener(ResultEvent.RESULT, createLoadBalancer_resultHandler);
			addEventListener(FaultEvent.FAULT, defaultElb_faultHandler);
			send();
		}
		
		
		/***************************
		 * Result Handlers
		 * ************************/
		
		private function getElbPrices_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, getElbPrices_resultHandler);
			prices = new ArrayCollection(result["prices"] as Array);
		}
		
		private function createLoadBalancer_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, createLoadBalancer_resultHandler);
			dispatchEvent(new CreateLoadBalancerResultEvent(result));
		}
			
		/**
		 * Fault Handlers
		 * */
		
		private function defaultElb_faultHandler(event:FaultEvent):void
		{
			removeEventListener(FaultEvent.FAULT, defaultElb_faultHandler);
			dispatchEvent(new ElbServiceFaultEvent(event.fault));
		}
	}
}