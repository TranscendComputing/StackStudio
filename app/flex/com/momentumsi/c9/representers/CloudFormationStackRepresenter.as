package com.momentumsi.c9.representers
{
	import mx.collections.ArrayCollection;

	[Bindable]
	public class CloudFormationStackRepresenter extends RepresenterBase
	{
		public function CloudFormationStackRepresenter(data:Object)
		{
			super(data);
		}
		
		public function get id():String 
		{
			return data.StackId;
		}
		
		public function get name():String 
		{
			return data.StackName;
		}
		
		public function get status():String 
		{
			return data.StackStatus;
		}
		
		public function get disableRollback():Boolean 
		{
			return data.DisableRollback;
		}
		
		public function get capabilities():ArrayCollection 
		{
			return new ArrayCollection(data.Capabilities as Array);
		}
		
		public function get parameters():ArrayCollection 
		{
			return new ArrayCollection(data.Parameters as Array);
		}
		
		public function get outputs():ArrayCollection 
		{
			return new ArrayCollection(data.Outputs as Array);
		}
	}
}