package com.momentumsi.c9.components
{
	import mx.controls.Text;
	import mx.core.mx_internal;
	
	public class DetailsBoxLabel extends Text
	{
		public function DetailsBoxLabel()
		{
			super();
			selectable = true;
		}

		override public function set text(value:String):void
		{
			if(value == null)
			{
				super.text = "-";
			}else{
				super.text = value;
			}
		}
	}
}