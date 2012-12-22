package com.momentumsi.c9.components
{
	import com.momentumsi.c9.constants.Color;
	import com.momentumsi.c9.constants.ImagePath;
	
	import flash.events.MouseEvent;
	
	import mx.controls.Tree;
	import mx.core.IFactory;
	
	public class CustomTree extends Tree
	{
		public function CustomTree()
		{
			super();
			super.setStyle("backgroundAlpha", "0");
			super.setStyle("borderStyle", "none");
			super.setStyle("defaultLeafIcon", ImagePath.FILE_ICON);
			super.setStyle("disclosureClosedIcon", ImagePath.CLOSED_ARROW_ICON);
			super.setStyle("disclosureOpenIcon", ImagePath.OPEN_ARROW_ICON);
			super.setStyle("folderClosedIcon", ImagePath.CLOSED_FOLDER_ICON);
			super.setStyle("folderOpenIcon", ImagePath.OPEN_FOLDER_ICON);
			super.setStyle("rollOverColor", Color.ORANGE);
			super.setStyle("selectionColor", Color.ORANGE);
			
			super.addEventListener(MouseEvent.DOUBLE_CLICK, tree1_doubleClickHandler);
			super.doubleClickEnabled = true;
			super.labelField = "name";
			super.verticalScrollPolicy = "auto";
		}
		
		private function tree1_doubleClickHandler(event:MouseEvent):void
		{
			var item:Object = event.currentTarget.selectedItem;
			if (this.dataDescriptor.isBranch(item)) 
			{
				if(this.isItemOpen(item))
					this.expandItem(item, false);
				else
					this.expandItem(item, true);
			}
		}
	}
}