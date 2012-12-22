package com.momentumsi.c9.events.beanstalk
{
	import mx.rpc.events.ResultEvent;
	
	public class DescribeEnvironmentsResultEvent extends ResultEvent
	{
		public static const RESULT:String = "describeEnvironmentsResult";
		
		public function DescribeEnvironmentsResultEvent(result:Object=null)
		{
			super(RESULT, false, false, result);
		}
	}
}