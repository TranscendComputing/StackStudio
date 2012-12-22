package com.momentumsi.c9.templates
{
	public class UserdataObject
	{
		public var data:Object = new Object();
		public var serverName:String = "NewServer";
		public var userKeys:String = "HostKeys";
		public var waitHandle:String = "WAITHANDLE";
		public var chefBucket:String;
		public var chefServerUrl:String;
		
		public function UserdataObject()
		{
		}
		
		public function getData():Object
		{
			//Override in extended classes
			return new Object();
		}
	}
}