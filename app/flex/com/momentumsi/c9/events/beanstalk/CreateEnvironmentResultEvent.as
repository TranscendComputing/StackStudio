package com.momentumsi.c9.events.beanstalk
{
	import mx.rpc.events.ResultEvent;
	
	public class CreateEnvironmentResultEvent extends ResultEvent
	{
		public static const RESULT:String = "createEnvironmentResult";
		
		public function CreateEnvironmentResultEvent(result:Object=null)
		{
			super(RESULT, false, false, result);
		}
	}
}