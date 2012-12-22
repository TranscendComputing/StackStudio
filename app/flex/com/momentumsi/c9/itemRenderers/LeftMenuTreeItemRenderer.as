package com.momentumsi.c9.itemRenderers
{
	import mx.controls.treeClasses.*;
	import mx.collections.*;
	
	public class LeftMenuTreeItemRenderer extends TreeItemRenderer
	{
		
		// Define the constructor.      
		public function LeftMenuTreeItemRenderer() {
			super();
		}
		
		// Override the set method for the data property
		// to set the font color and style of each node.        
		override public function set data(value:Object):void {
			if(value != null)
			{
				super.data = value;
				if(TreeListData(super.listData).hasChildren)
				{
					setStyle("color", 0x330066);
					setStyle("fontWeight", 'bold');
					setStyle("fontSize", 13);
				}
				else
				{
					setStyle("color", 0x330066);
					setStyle("fontWeight", 'bold');
					setStyle("fontSize", 11);
				}
			}
		}
		
		// Override the updateDisplayList() method 
		// to set the text for each tree node.      
		override protected function updateDisplayList(unscaledWidth:Number, 
													  unscaledHeight:Number):void {
			
			super.updateDisplayList(unscaledWidth, unscaledHeight);
			
		}
	}
}