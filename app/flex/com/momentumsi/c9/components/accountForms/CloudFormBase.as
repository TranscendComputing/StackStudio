package com.momentumsi.c9.components.accountForms
{
	import com.momentumsi.c9.components.CloudServicesWindow;
	import com.momentumsi.c9.models.Cloud;
	import com.momentumsi.c9.models.CloudAccount;
	import com.momentumsi.c9.models.User;
	import com.momentumsi.c9.services.IdentityService;
	
	import flash.events.MouseEvent;
	
	import mx.collections.ArrayCollection;
	import mx.core.UIComponent;
	import mx.events.CollectionEvent;
	import mx.managers.PopUpManager;
	
	import spark.components.Form;
	import spark.layouts.FormLayout;
	
	[Bindable]
	public class CloudFormBase extends Form
	{
		public var account:CloudAccount;
		public var user:User;
		public var cloudVersionCollection:ArrayCollection = new ArrayCollection();
		public var selectedVersion:int = 0;
		public var identityService:IdentityService;
		public var cloud:Cloud;
		
		public function CloudFormBase()
		{
			var customLayout:FormLayout = new FormLayout();
			customLayout.gap = -7;
			super();
			layout = customLayout;
			cloudVersionCollection.addEventListener(CollectionEvent.COLLECTION_CHANGE, setVersionSelection);
		}
		
		private function setVersionSelection(event:CollectionEvent):void
		{
			
			for(var i:int = 0; i < cloudVersionCollection.length; i++)
			{
				if(cloudVersionCollection[i].name == account.cloud_name)
				{
					selectedVersion = i;
					break;
				}
			}
		}

		public function saveAccount():void
		{
			//Overridden in the forms
		}
		
		public function cloudServicesButton_clickHandler(event:MouseEvent):void
		{
			var servicesWindow:CloudServicesWindow = new CloudServicesWindow();
			var selectedCloud:Cloud = cloudVersionCollection.getItemAt(selectedVersion) as Cloud;	
			servicesWindow.cloud = selectedCloud;
			PopUpManager.addPopUp(servicesWindow, UIComponent(parentApplication), true);
		}
		
		public function imageServicesButton_clickHandler(event:MouseEvent):void
		{
			
		}
	}
}