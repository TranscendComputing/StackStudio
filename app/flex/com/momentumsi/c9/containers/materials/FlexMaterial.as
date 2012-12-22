package com.momentumsi.c9.containers.materials
{
	import flash.display.DisplayObject;
	import flash.events.Event;
	
	import mx.core.Container;
	import mx.core.UIComponent;
	import mx.events.FlexEvent;
	
	import org.papervision3d.materials.MovieMaterial;

	public class FlexMaterial extends MovieMaterial
	{
		public function FlexMaterial(movieAsset:DisplayObject=null, transparent:Boolean=true)
		{
			if(movieAsset is UIComponent) {
				addUpdateListeners(UIComponent(movieAsset));
			}
			
			super(movieAsset, transparent, false);	
		}
		
		private function addUpdateListeners(component:UIComponent):void {
			component.addEventListener(FlexEvent.UPDATE_COMPLETE, handleUpdateComplete, false, 10, true);
			
			if(component is Container) {
				var n:int = Container(component).numChildren;
				
				for(var i:int=0; i<n; i++) {
					var child:DisplayObject = component.getChildAt(i);
					
					if(child is UIComponent) {
						addUpdateListeners(UIComponent(child));
					}
				}
			}
		}
		
		private function handleUpdateComplete(event:Event):void {
			updateBitmap();
		}
	}
}