package com.momentumsi.c9.events
{
	import flash.events.Event;
	
	import mx.collections.ArrayCollection;
	
	public class LoadTemplateEvent extends Event
	{
		public static const LOADED:String = "templateLoaded";
		public var elements:ArrayCollection;
		public var templateSource:String;
		public var links:ArrayCollection;
		public function LoadTemplateEvent(elements:ArrayCollection, template:String, links:ArrayCollection)
		{
			super(LOADED, true);
			this.elements = elements;
			this.templateSource = template;
			this.links = links;
		}
	}
}