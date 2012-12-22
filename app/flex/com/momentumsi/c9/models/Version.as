package com.momentumsi.c9.models
{
	import mx.collections.ArrayCollection;

	[Bindable]
	public class Version
	{
		public var description:String;
		public var number:String;
		public var environments:ArrayCollection = new ArrayCollection();
		
		public function Version(number:String=null, description:String=null)
		{
			this.number = number;
			this.description = description;
		}
		
		public static function buildVersion(version:Object):Version
		{
			var newVersion:Version = new Version();
			
			newVersion.description = version.description;
			newVersion.number = version.number;
			
			var objectCollection:ArrayCollection = new ArrayCollection(version.environments as Array);
			for each(var item:Object in objectCollection)
			{
				newVersion.environments.addItem(Environment.buildEnvironment(item.environment));
			}
			
			return newVersion;
		}
	}
}