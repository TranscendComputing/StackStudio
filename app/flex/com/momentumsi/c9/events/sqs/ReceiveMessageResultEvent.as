package com.momentumsi.c9.events.sqs
{
	import mx.rpc.events.ResultEvent;
	
	public class ReceiveMessageResultEvent extends ResultEvent
	{
		public static const RESULT:String = "receiveMessageResult";
		
		public var body:String;
		
		public var receivedMessageId:String;
		public var receiptHandle:String;
		public var md5OfBody:String;
		public var senderId:String
		public var receiveCount:String;
		
		public function ReceiveMessageResultEvent(result:Object=null)
		{
			if(result != null)
			{
				md5OfBody = result.MD5OfBody;
				receivedMessageId = result.MessageId;
				body = result.Body;
				senderId = result.Attributes.SenderId;
				receiveCount = result.Attributes.ApproximateReceiveCount;
			}
			super(RESULT, true, true, result);
		}
	}
}