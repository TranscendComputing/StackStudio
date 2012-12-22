package com.momentumsi.c9.containers {
	import flash.events.MouseEvent;
	
	import spark.components.Button;
	import spark.components.SkinnableContainer;

	[SkinState("opened")]
	public class Drawer extends SkinnableContainer {
		private var _opened:Boolean = true;

		[SkinPart(required="false")]
		public var openButton:Button;

		public function get opened():Boolean {
			return _opened;
		}

		public function set opened(value:Boolean):void {
			if (_opened != value) {
				_opened = value;
				invalidateSkinState();
			}
		}

		private function clickHandler(event:MouseEvent):void {
			opened = !opened;
		}

		override protected function partAdded(partName:String, instance:Object):void {
			super.partAdded(partName, instance);

			if (instance == openButton) {
				(instance as Button).addEventListener(MouseEvent.CLICK, clickHandler);
			}
		}

		override protected function partRemoved(partName:String, instance:Object):void {
			if (instance == openButton) {
				(instance as Button).removeEventListener(MouseEvent.CLICK, clickHandler);
			}

			super.partRemoved(partName, instance);
		}

		override protected function getCurrentSkinState():String {
			return (opened ? 'opened' : super.getCurrentSkinState());
		}
	}
}