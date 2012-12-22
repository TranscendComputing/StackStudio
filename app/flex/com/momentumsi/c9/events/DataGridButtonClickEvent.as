package com.momentumsi.c9.events
{
	import flash.display.InteractiveObject;
	import flash.events.MouseEvent;
	
	public class DataGridButtonClickEvent extends MouseEvent
	{
		public static const CLICK:String = "dataGridButtonClick";
		
		public var data:Object;
		
		public function DataGridButtonClickEvent(data:Object)
		{
			this.data = data;
			super(CLICK);
		}
	}
}