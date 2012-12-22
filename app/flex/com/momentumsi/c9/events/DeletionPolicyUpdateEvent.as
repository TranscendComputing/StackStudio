package com.momentumsi.c9.events
{
	import flash.events.Event;
	
	import mx.collections.ArrayCollection;
	
	public class DeletionPolicyUpdateEvent extends Event
	{
		public static const POLICY_UPDATE:String = "update";
		public var elements:ArrayCollection;
		public function DeletionPolicyUpdateEvent(elements:ArrayCollection)
		{
			super(POLICY_UPDATE, true);
			this.elements = elements;
		}
	}
}