package com.momentumsi.c9.services
{
	import com.momentumsi.c9.events.sqs.CreateQueueResultEvent;
	import com.momentumsi.c9.events.sqs.ReceiveMessageResultEvent;
	import com.momentumsi.c9.events.sqs.SendMessageResultEvent;
	import com.momentumsi.c9.events.sqs.SetQueueAttributesResultEvent;
	import com.momentumsi.c9.events.sqs.SqsServiceFaultEvent;
	
	import mx.rpc.events.FaultEvent;
	import mx.rpc.events.ResultEvent;

	[Event(name="receiveMessageResult", type="com.momentumsi.c9.events.sqs.ReceiveMessageResultEvent")]
	[Event(name="sendMessageResult", type="com.momentumsi.c9.events.sqs.SendMessageResultEvent")]
	[Event(name="setQueueAttributesResult", type="com.momentumsi.c9.events.sqs.SetQueueAttributesResultEvent")]
	[Event(name="createQueueResult", type="com.momentumsi.c9.events.sqs.CreateQueueResultEvent")]
	
	[Event(name="sqsServiceFault", type="com.momentumsi.c9.events.sqs.SqsServiceFaultEvent")]
	[Binable]
	public class SqsService extends CloudApiService
	{
		public static const CREATE_QUEUE:String = "create_queue";
		public static const SEND_MESSAGE:String = "send_message";
		public static const RECEIVE_MESSAGE:String = "receive_message";
		public static const SET_QUEUE_ATTRIBUTES:String = "set_queue_attributes";
		
		public var queueUrl:String;
		
		public function SqsService(rootURL:String=null, destination:String=null)
		{
			super(rootURL, destination);
			serviceType = SQS_SERVICE;
			setPost();
		}
		
		public function createQueue(parameters:Object):void
		{
			setPost();
			action = CREATE_QUEUE;
			addEventListener(ResultEvent.RESULT, createQueue_resultHandler);
			addEventListener(FaultEvent.FAULT, sqsService_faultHandler);
			request = parameters;
			send();
		}
		
		public function sendMessage(message:String):void
		{
			action = SEND_MESSAGE;
			addEventListener(ResultEvent.RESULT, sendMessage_resultHandler);
			addEventListener(FaultEvent.FAULT, sqsService_faultHandler);
			request = {
				queue_url: queueUrl,
				message: message
			};
			send();
		}
		
		public function receiveMessage():void
		{
			action = RECEIVE_MESSAGE;
			addEventListener(ResultEvent.RESULT, receiveMessage_resultHandler);
			addEventListener(FaultEvent.FAULT, sqsService_faultHandler);
			request = {queue_url: queueUrl};
			send();
		}
		
		public function setAttributes(attributes:Object):void
		{
			action = SET_QUEUE_ATTRIBUTES;
			addEventListener(ResultEvent.RESULT, setAttributes_resultHandler);
			addEventListener(FaultEvent.FAULT, sqsService_faultHandler);
			request = {queue_url: queueUrl, queue_attributes: attributes};
			send();
		}
		
		//Result Handlers
		
		private function createQueue_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, createQueue_resultHandler);
			dispatchEvent(new CreateQueueResultEvent(result));
		}
		
		private function sendMessage_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, sendMessage_resultHandler);
			dispatchEvent(new SendMessageResultEvent(result));
		}
		
		private function receiveMessage_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, receiveMessage_resultHandler);
			dispatchEvent(new ReceiveMessageResultEvent(result));
		}
		
		private function setAttributes_resultHandler(event:ResultEvent):void
		{
			removeEventListener(ResultEvent.RESULT, setAttributes_resultHandler);
			dispatchEvent(new SetQueueAttributesResultEvent(result));
		}
		
		//Fault Handlers
		
		private function sqsService_faultHandler(event:FaultEvent):void
		{
			removeEventListener(FaultEvent.FAULT, sqsService_faultHandler);
			dispatchEvent(new SqsServiceFaultEvent(event.fault));
		}
	}
}