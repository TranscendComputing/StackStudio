package com.momentumsi.c9.events
{
	import com.momentumsi.c9.models.Element;
	
	import flash.events.Event;
	
	public class ElementSaveEvent extends Event
	{
		public static const RESULT:String = "resultElement";
		public var element:Element;
		public function ElementSaveEvent(element:Object)
		{
			super(RESULT, true);
			if(element is Element)
			{
				this.element = element as Element;
			}else{
				this.element = Element.buildElement(element["element"]);
			}
		}
	}
}