package com.momentumsi.c9.events.sqs
{
	import mx.messaging.messages.IMessage;
	import mx.rpc.AsyncToken;
	import mx.rpc.events.ResultEvent;
	
	public class SendMessageResultEvent extends ResultEvent
	{
		public static const RESULT:String = "sendMessageResult";
		
		public var md5OfMessageBody:String;
		public var receivedMessageId:String;
		
		public function SendMessageResultEvent(result:Object=null)
		{
			md5OfMessageBody = result.MD5OfMessageBody;
			receivedMessageId = result.MessageId;
			super(RESULT, true, true);
		}
	}
}