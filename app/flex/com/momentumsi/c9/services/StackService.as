package com.momentumsi.c9.services
{
	import com.adobe.serialization.json.JSON;
	import com.maccherone.json.JSON;
	import com.momentumsi.c9.models.Stack;
	
	import flash.events.Event;
	
	import mx.collections.ArrayCollection;
	import mx.core.FlexGlobals;
	import mx.rpc.AsyncToken;
	import mx.rpc.events.FaultEvent;
	import mx.rpc.events.ResultEvent;

	[Event(name="stackSet", type="flash.events.Event")]
	[Bindable]
	public class StackService extends ApiService
	{	
		private var stackUrl:String;
		public var stack:Stack;
		
		public function StackService(rootURL:String=null, destination:String=null)
		{
			super(rootURL, destination);
			stackUrl = url + "/stackstudio/v1/stacks";
		}
		
		public function createNewStack(stack:Stack):void
		{
			setPost();
			url = stackUrl;
			request = stack.toObject();
			addEventListener(ResultEvent.RESULT, createStack_resultHandler);
			addEventListener(FaultEvent.FAULT, createStack_faultHandler);
			send();
		}
		
		private function createStack_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, createStack_resultHandler);
			/*
			stack = Stack.buildStack(result["stack"]);
			dispatchEvent(new Event("stackSet"));
			*/
		}
		
		private function createStack_faultHandler(event:FaultEvent):void
		{
			removeEventListener(FaultEvent.FAULT, createStack_faultHandler);
			dispatchEvent(new FaultEvent(FaultEvent.FAULT))
		}
		

		
	}
}