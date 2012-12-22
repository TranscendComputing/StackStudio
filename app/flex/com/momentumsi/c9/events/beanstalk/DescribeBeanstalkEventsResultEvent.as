package com.momentumsi.c9.events.beanstalk
{
	import mx.rpc.events.ResultEvent;
	
	public class DescribeBeanstalkEventsResultEvent extends ResultEvent
	{
		public static const RESULT:String = "describeBeanstalkEventsResult";
		
		public function DescribeBeanstalkEventsResultEvent(result:Object=null)
		{
			super(RESULT, false, false, result);
		}
	}
}