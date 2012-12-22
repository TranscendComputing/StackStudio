package com.momentumsi.c9.models.resources
{
	import mx.collections.ArrayCollection;

	[Bindable]
	public class PuppetClass
	{
		private var data:Object;
		public var name:String;
		public var longDescription:String;
		public var type:String;
		
		private var _classArguments:ArrayCollection;
		
		public function PuppetClass(puppetClass:Object)
		{
			this.data = puppetClass;
			name = puppetClass.name;
			longDescription = puppetClass.doc;
			type = puppetClass.type;
			
			_classArguments = objectToArrayCollection(puppetClass.arguments);
		}
		
		public function get classArguments():ArrayCollection 
		{
			return _classArguments;
		}
		
		public function get argumentsDisplay():String 
		{
			return arrayCollectionToString(classArguments);
		}
		
		private function objectToArrayCollection(object:Object):ArrayCollection
		{
			var collection:ArrayCollection = new ArrayCollection();
			for(var n:* in object)
			{
				collection.addItem({name: n, value: object[n]});
			}
			return collection;
		}
		
		private function arrayCollectionToString(collection:ArrayCollection):String
		{
			var displayArray:Array = [];
			var displayString:String;
			for each(var item:Object in collection)
			{
				displayString = item.name + " => " + item.value;
				displayArray.push(displayString);
			}
			return displayArray.join("\n");
		}
		
		public function toObject():Object
		{
			return {
				name: name, 
				description: longDescription,
				puppet_type: type
			};
		}
	}
}