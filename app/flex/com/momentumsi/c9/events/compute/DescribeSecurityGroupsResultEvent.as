package com.momentumsi.c9.events.compute
{
	import mx.rpc.events.ResultEvent;
	
	public class DescribeSecurityGroupsResultEvent extends ResultEvent
	{
		public static const RESULT:String = "describeSecurityGroupsResult";
		
		public function DescribeSecurityGroupsResultEvent(result:Object=null)
		{
			super(RESULT, false, true, result);
		}
	}
}