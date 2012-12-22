package com.momentumsi.c9.events
{
	import com.momentumsi.c9.components.CheckBoxListItem;
	
	import flash.events.Event;
	
	public class CheckBoxListItemEvent extends Event
	{
		public static const ITEM_SELECTION_CHANGE:String = "itemSelectionChange";
		public var item:CheckBoxListItem;
		public function CheckBoxListItemEvent(item:Object)
		{
			super(ITEM_SELECTION_CHANGE);
			this.item = item as CheckBoxListItem;
		}
	}
}