package com.momentumsi.c9.models.resources
{
	import mx.collections.ArrayCollection;

	[Bindable]
	public class ChefCookbook
	{
		private var data:Object;
		public var name:String;
		public var version:String;
		public var longDescription:String;
		
		private var _platforms:ArrayCollection;
		private var _recipes:ArrayCollection;
		private var _dependencies:ArrayCollection;
		
		public function ChefCookbook(cookbook:Object)
		{
			this.data = cookbook;
			name = cookbook.name;
			version = cookbook.version;
			longDescription = cookbook.long_description;
			
			_platforms = objectToArrayCollection(cookbook.platforms);
			_recipes = objectToArrayCollection(cookbook.recipes);
			_dependencies = objectToArrayCollection(cookbook.dependencies);
		}
		
		public function get platforms():ArrayCollection 
		{
			return _platforms;
		}
		
		public function get platformsDisplay():String 
		{
			return arrayCollectionToString(platforms);
		}
		
		public function get recipes():ArrayCollection 
		{
			return _recipes;
		}
		
		public function get recipesDisplay():String 
		{
			return arrayCollectionToString(recipes);
		}
		
		public function get dependencies():ArrayCollection 
		{
			return _recipes;
		}
		
		public function get dependenciesDisplay():String 
		{
			return arrayCollectionToString(dependencies);
		}
		
		// Used to determine if this cookbook is compatible, platform-wise, with another
		public function hasCompatiblePlatform(platform:String):Boolean
		{
			if(platforms.length == 0)
			{
				return true;
			}else{
				for each(var obj:Object in platforms)
				{
					if(obj.name == platform)
					{
						return true;
					}
				}
				
				return false;
			}
		}
		
		private function objectToArrayCollection(object:Object):ArrayCollection
		{
			var collection:ArrayCollection = new ArrayCollection();
			for(var n:* in object)
			{
				collection.addItem({name: n, version: object[n]});
			}
			return collection;
		}
		
		private function arrayCollectionToString(collection:ArrayCollection):String
		{
			var displayArray:Array = [];
			var displayString:String;
			for each(var item:Object in collection)
			{
				displayString = item.name + "  " + item.version;
				displayArray.push(displayString);
			}
			return displayArray.join("\n");
		}
	}
}