package com.momentumsi.c9.components
{
	import mx.collections.ArrayCollection;

	[Bindable]
	public class CheckBoxListItem
	{	
		public var label:String;
		public var data:Object;
		private var _selected:Boolean = false;
		public var secondaryCollection:ArrayCollection = new ArrayCollection();
		
		public function CheckBoxListItem()
		{
		}
		
		public function get selected():Boolean
		{
			if(data != null && data.hasOwnProperty("selected"))
			{
				return data.selected;
			}else{
				return _selected;
			}
		}
		
		public function set selected(value:Boolean):void
		{
			_selected = value;
			if(data != null && data.hasOwnProperty("selected"))
			{
				data.selected = value;
			}
		}		
	}
}