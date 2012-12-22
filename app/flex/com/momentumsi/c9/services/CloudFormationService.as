package com.momentumsi.c9.services
{
	import com.momentumsi.c9.events.cloudFromation.*;
	import com.momentumsi.c9.representers.CloudFormationStackEventRepresenter;
	import com.momentumsi.c9.representers.CloudFormationStackRepresenter;
	
	import mx.collections.ArrayCollection;
	import mx.rpc.AsyncToken;
	import mx.rpc.events.FaultEvent;
	import mx.rpc.events.ResultEvent;

	[Event(name="describeStackEventsResult", type="com.momentumsi.c9.events.cloudFromation.DescribeStackEventsResultEvent")]
	[Event(name="describeStackEventsFault", type="com.momentumsi.c9.events.cloudFromation.DescribeStackEventsFaultEvent")]
	[Event(name="describeStacksResult", type="com.momentumsi.c9.events.cloudFromation.DescribeStacksResultEvent")]
	[Event(name="describeStacksFault", type="com.momentumsi.c9.events.cloudFromation.DescribeStacksFaultEvent")]
	[Event(name="createCFStackResult", type="com.momentumsi.c9.events.cloudFromation.CreateCFStackResultEvent")]
	[Event(name="createCFStackFault", type="com.momentumsi.c9.events.cloudFromation.CreateCFStackFaultEvent")]
	[Event(name="updateCFStackResult", type="com.momentumsi.c9.events.cloudFromation.UpdateCFStackResultEvent")]
	[Event(name="updateCFStackFault", type="com.momentumsi.c9.events.cloudFromation.UpdateCFStackFaultEvent")]
	[Event(name="deleteCFStackResult", type="com.momentumsi.c9.events.cloudFromation.DeleteCFStackResultEvent")]
	
	[Event(name="cfServiceFault", type="com.momentumsi.c9.events.cloudFromation.CFServiceFaultEvent")]
	
	[Bindable]
	public class CloudFormationService extends CloudApiService
	{
		//Actions
		public static const DESCRIBE_EVENTS:String = "describe_stack_events";
		public static const DESCRIBE_STACKS:String = "describe_stacks";
		public static const CREATE_STACK:String = "create_stack";
		public static const UPDATE_STACK:String = "update_stack";
		public static const DELETE_STACK:String = "delete_stack";
		
		//Collections
		public var events:ArrayCollection = new ArrayCollection();
		public var stacks:ArrayCollection = new ArrayCollection();
		public var stack:CloudFormationStackRepresenter;
		
		//Service tokens
		private var describeEventsToken:AsyncToken;
		private var createStackToken:AsyncToken;
		private var updateStackToken:AsyncToken;
		
		public function CloudFormationService(rootURL:String=null, destination:String=null)
		{
			super(rootURL, destination);
			serviceType = CF_SERVICE;
		}
		
		public function describeEvents(stackName:String):void
		{
			action = DESCRIBE_EVENTS;
			request = {stack_name: stackName};
			addEventListener(ResultEvent.RESULT, describeEvents_resultHandler);
			addEventListener(FaultEvent.FAULT, describeEvents_faultHandler);
			describeEventsToken = send();
		}
		
		public function createStack(stackName:String, templateBody:String, parameterKeys:Array, parameterValues:Array, notificationArns:String, creationTimeout:String, disableRollback:Boolean):void
		{
			var keysString:String = parameterKeys.join(",");
			var valuesString:String = parameterValues.join(",");
			
			setPost();
			action = CREATE_STACK;
			request = {
				name: stackName, 
				body: templateBody, 
				parameterKeys: keysString, 
				parameterValues: valuesString,
				sns_topic: notificationArns,
				creation_timeout: creationTimeout,
				disable_rollback: disableRollback
			};
			addEventListener(ResultEvent.RESULT, createStack_resultEvent);
			addEventListener(FaultEvent.FAULT, createStack_faultEvent);
			createStackToken = send();
		}
		
		public function updateStack(stackName:String, templateBody:String, parameterKeys:Array, parameterValues:Array):void
		{
			var keysString:String = parameterKeys.join(",");
			var valuesString:String = parameterValues.join(",");
			
			setPost();
			action = UPDATE_STACK;
			request = {
				name: stackName, 
				body: templateBody, 
				parameterKeys: keysString, 
				parameterValues: valuesString
			};
			addEventListener(ResultEvent.RESULT, updateStack_resultEvent);
			addEventListener(FaultEvent.FAULT, updateStack_faultEvent);
			updateStackToken = send();
		}
		
		public function describeStacks(stackName:String=null):void
		{
			action = DESCRIBE_STACKS;
			request = {stack_name: stackName};
			addEventListener(ResultEvent.RESULT, describeStacks_resultHandler);
			addEventListener(FaultEvent.FAULT, describeStacks_faultHandler);
			send();
		}
		
		public function deleteStack(stackName:String):void
		{
			setPost();
			action = DELETE_STACK;
			request = {stack_name: stackName};
			addEventListener(ResultEvent.RESULT, deleteStack_resultHandler);
			addEventListener(FaultEvent.FAULT, cfService_faultHandler);
			send();
		}
		
		/*******************
		 * Result Handlers
		 * *****************/
		
		private function describeEvents_resultHandler(event:ResultEvent):void
		{
			if(describeEventsToken == event.token)
			{
				removeEventListener(ResultEvent.RESULT, describeEvents_resultHandler);
				
				events.removeAll();
				var eventsResult:ArrayCollection = new ArrayCollection(result as Array);
				for each(var item:Object in eventsResult)
				{
					events.addItem(new CloudFormationStackEventRepresenter(item));
				}
				describeEventsToken = null;
				dispatchEvent(new DescribeStackEventsResultEvent(result));
			}
		}
		
		private function createStack_resultEvent(event:ResultEvent):void
		{
			if(createStackToken == event.token)
			{
				removeEventListener(ResultEvent.RESULT, createStack_resultEvent);
				createStackToken = null;
				dispatchEvent(new CreateCFStackResultEvent(result));
			}
		}
		
		private function updateStack_resultEvent(event:ResultEvent):void
		{
			if(updateStackToken == event.token)
			{
				removeEventListener(ResultEvent.RESULT, updateStack_resultEvent);
				updateStackToken = null;
				dispatchEvent(new UpdateCFStackResultEvent(result));
			}
		}
		
		private function describeStacks_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, describeStacks_resultHandler);
			removeEventListener(FaultEvent.FAULT, describeStacks_faultHandler);	
			if(result is Array)
			{
				stacks = new ArrayCollection();
				var resultColl:ArrayCollection = new ArrayCollection(result as Array);
				for each(var item:Object in resultColl)
				{
					stacks.addItem(new CloudFormationStackRepresenter(item));
				}
			}else{
				stack = new CloudFormationStackRepresenter(result);
			}
			dispatchEvent(new DescribeStacksResultEvent(result));
		}
		
		private function deleteStack_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, deleteStack_resultHandler);
			dispatchEvent(new DeleteCFStackResultEvent(result));
		}
		
		/*******************
		 * Fault Handlers
		 * *****************/
		
		private function describeEvents_faultHandler(event:FaultEvent):void
		{
			if(describeEventsToken == event.token)
			{
				removeEventListener(FaultEvent.FAULT, describeEvents_faultHandler);
				describeEventsToken = null;
				dispatchEvent(new DescribeStackEventsFaultEvent(event.fault));
			}
		}
		
		private function createStack_faultEvent(event:FaultEvent):void
		{
			if(createStackToken == event.token)
			{
				removeEventListener(FaultEvent.FAULT, createStack_faultEvent);
				createStackToken = null;
				dispatchEvent(new CreateCFStackFaultEvent(event.fault));
			}
		}
		
		private function updateStack_faultEvent(event:FaultEvent):void
		{
			if(updateStackToken == event.token)
			{
				removeEventListener(FaultEvent.FAULT, updateStack_faultEvent);
				updateStackToken = null;
				dispatchEvent(new UpdateCFStackFaultEvent(event.fault));
			}
		}
		
		private function describeStacks_faultHandler(event:FaultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, describeStacks_resultHandler);
			removeEventListener(FaultEvent.FAULT, describeStacks_faultHandler);
			dispatchEvent(new DescribeStacksFaultEvent(event.fault));
		}
		
		private function cfService_faultHandler(event:FaultEvent):void
		{
			removeEventListener(FaultEvent.FAULT, cfService_faultHandler);
			dispatchEvent(new CFServiceFaultEvent(event.fault));
		}
			
	}
}