package com.momentumsi.c9.services
{
	import com.momentumsi.c9.converters.XML2JSON;
	
	import flash.net.URLRequest;
	import flash.net.URLRequestMethod;
	import flash.net.navigateToURL;
	
	import mx.controls.Alert;
	import mx.rpc.events.FaultEvent;
	import mx.rpc.events.ResultEvent;
	import mx.rpc.http.mxml.HTTPService;
	
	public class RundeckService extends HTTPService
	{
		private var authToken:String;
		private var rundeckUrl:String;
		private var executionId:int;
		
		public var executionInfo:Object;
		public function RundeckService(rootURL:String=null, destination:String=null)
		{
			super(rootURL, destination);
			authToken = "v6vRs2RKDRO2eUp3nNd3rDOnRENkrEdD";
			rundeckUrl = "http://172.31.255.6:4440";
			resultFormat = "e4x";
		}
		
		public function runAdhocCommand(command:String):void
		{
			command = command.replace(/\n/g, ";");
			url = rundeckUrl + "/api/1/run/command?authtoken=" + authToken;
			request = {
				project: "Transcend",
				exec: command
			};			
			method = URLRequestMethod.POST;
			addEventListener(ResultEvent.RESULT, runAdhocCommand_resultHandler);
			addEventListener(FaultEvent.FAULT, runAdhocCommand_faultHandler);
			send();
		}
		
		public function getExecutionInfo(id:int):void
		{
			url = rundeckUrl + "/api/1/execution/" + id +  "?authtoken=" + authToken;
			method = URLRequestMethod.GET;
			addEventListener(ResultEvent.RESULT, getExecutionInfo_resultHandler);
			addEventListener(FaultEvent.FAULT, getExecutionInfo_faultHandler);
			send();
		}
		
		/***************************
		 * Result Handlers
		 * ************************/
		
		private function runAdhocCommand_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, runAdhocCommand_resultHandler);
			var result:Object = event.result as XML;
			executionId = result.execution.@id;
			var newRundeckService:RundeckService = new RundeckService();
			newRundeckService.getExecutionInfo(executionId);
		}
		
		private function getExecutionInfo_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, getExecutionInfo_resultHandler);
			var result:XML = event.result as XML;
			try
			{
				executionInfo = XML2JSON.parse(new XML(result.toString()));
				var link:String = executionInfo.executions.execution.href;
				link = link.replace("{}", "");
				var status:String = executionInfo.executions.execution.status;
				var req:URLRequest = new URLRequest();
				req.url = rundeckUrl + link;
				navigateToURL(req, '_blank');
			} 
			catch(error:Error){}
		}
		
		/***************************
		 * Fault Handlers
		 * ************************/
		
		private function runAdhocCommand_faultHandler(event:FaultEvent):void
		{
			removeEventListener(FaultEvent.FAULT, runAdhocCommand_faultHandler);
		}
		
		private function getExecutionInfo_faultHandler(event:FaultEvent):void
		{
			removeEventListener(FaultEvent.FAULT, getExecutionInfo_faultHandler);
		}
	}
}