package com.momentumsi.c9.events.project
{
	import mx.rpc.events.ResultEvent;
	
	public class FreezeVersionResultEvent extends ResultEvent
	{
		public static const RESULT:String = "freezeVersionResult";
		public var newVersion:String;
		
		public function FreezeVersionResultEvent(result:Object=null, newVersion:String=null)
		{
			this.newVersion = newVersion;
			super(RESULT, false, false, result);
		}
	}
}