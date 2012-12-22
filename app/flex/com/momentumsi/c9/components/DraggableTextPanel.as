package com.momentumsi.c9.components
{
	import com.momentumsi.c9.skins.resize.ResizeablePanelSkin;
	
	import flash.events.MouseEvent;
	
	import mx.events.FlexEvent;
	
	import spark.components.Panel;
	import spark.components.TextArea;
	
	public class DraggableTextPanel extends Panel
	{
		public var textArea:TextArea = new TextArea();
		[Bindable]
		public var install:Object;
		public function DraggableTextPanel()
		{
			super();
			percentWidth = 80; 
			height = 100;
			creationPolicy = "all";
			addEventListener(FlexEvent.CREATION_COMPLETE, creationCompleteHandler); 
			addEventListener(MouseEvent.MOUSE_DOWN, mouseDownHandler);
			textArea.percentHeight = 100;
			textArea.percentWidth = 100;
			addElement(textArea);
			setStyle("skinClass", Class(com.momentumsi.c9.skins.resize.ResizeablePanelSkin));
		}
		
		protected function mouseDownHandler(event:MouseEvent):void
		{
			//DragManager.doDrag(event.currentTarget as IUIComponent, null, event);
		}
		
		protected function creationCompleteHandler(event:FlexEvent):void
		{
			createDeferredContent();
		}
	}
}