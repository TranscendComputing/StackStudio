package com.momentumsi.c9.events.rds
{
	import mx.rpc.events.ResultEvent;
	
	public class DescribeDbSecuityGroupsResultEvent extends ResultEvent
	{
		public static const RESULT:String = "describeDbGroupsResult";
		public function DescribeDbSecuityGroupsResultEvent(result:Object=null)
		{
			super(RESULT, false, false, result);
		}
	}
}