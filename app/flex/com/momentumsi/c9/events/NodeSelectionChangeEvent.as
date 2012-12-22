package com.momentumsi.c9.events
{
	import com.momentumsi.c9.models.ProvisionedInstance;
	
	import flash.events.Event;

	public class NodeSelectionChangeEvent extends Event
	{
		public static const NODE_CHANGE:String = "nodeChange";
		public var instance:ProvisionedInstance;
		public function NodeSelectionChangeEvent(instance:ProvisionedInstance)
		{
			super(NODE_CHANGE, true);			
			this.instance = instance
		}
	}
}