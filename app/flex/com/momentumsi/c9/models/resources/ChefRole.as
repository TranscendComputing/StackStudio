package com.momentumsi.c9.models.resources
{
	import com.momentumsi.c9.constants.PlatformConstants;
	
	import flash.events.EventDispatcher;
	import flash.events.IEventDispatcher;
	
	import mx.collections.ArrayCollection;
	
	[Bindable]
	public class ChefRole extends EventDispatcher
	{
		private var supportedPlatforms:ArrayCollection = new ArrayCollection([PlatformConstants.AWS_LINUX.toLowerCase(),PlatformConstants.UBUNTU.toLowerCase()]);
		
		private var data:Object;
		public var name:String;
		public var description:String;
		public var jsonClass:String;
		public var defaultAttributes:Object;
		public var overrideAttributes:Object;
		public var chefType:String;
		public var envRunLists:Object;
		
		private var _runList:ArrayCollection;
		private var _cookbooks:ArrayCollection;
		public var availablePlatforms:ArrayCollection = new ArrayCollection();
		
		public function ChefRole(data:Object)
		{
			this.data = data;
			name = data.name;
			description = data.description;
			jsonClass = data.json_class;
			defaultAttributes = data.default_attributes;
			overrideAttributes = data.override_attributes;
			chefType = data.chef_type;
			envRunLists = data.env_run_lists;

			_runList = new ArrayCollection(data.run_list as Array);
			
			_cookbooks = new ArrayCollection();
			var coll:ArrayCollection = new ArrayCollection(data.cookbooks as Array);
			for each(var item:Object in coll)
			{
				_cookbooks.addItem(new ChefCookbook(item.metadata));
			}
			
			//Determine which platforms are available
			determinePlatforms();
		}
		
		public function get runList():ArrayCollection 
		{
			return _runList;
		}
		
		public function get cookbooks():ArrayCollection
		{
			return _cookbooks;
		}
		
		private function determinePlatforms():void
		{
			//Set available platforms to all
			availablePlatforms.addAll(supportedPlatforms);
			
			//Remove platforms not found in cookbooks
			var index:int;
			for each(var cookbook:ChefCookbook in _cookbooks)
			{
				for each(var type:String in availablePlatforms)
				{
					if(cookbook.hasCompatiblePlatform(type) == false)
					{
						index = availablePlatforms.getItemIndex(type);
						availablePlatforms.removeItemAt(index);
					}
				}
			}
		}
		
		public function get nodeFormattedProperties():Object
		{
			var properties:Object = {
				name: data.name,
				description: data.description,
				default_attributes: data.default_attributes,
				override_attributes: data.override_attributes,
				chef_type: data.chef_type,
				env_run_lists: data.env_run_lists,
				run_list: data.run_list
			};
			return properties;
		}
	}
}