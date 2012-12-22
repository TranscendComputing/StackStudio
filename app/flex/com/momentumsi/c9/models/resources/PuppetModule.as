package com.momentumsi.c9.models.resources
{
	import com.momentumsi.c9.constants.PlatformConstants;
	
	import flash.events.EventDispatcher;
	
	import mx.collections.ArrayCollection;
	
	[Bindable]
	public class PuppetModule extends EventDispatcher
	{
		private var supportedPlatforms:ArrayCollection = new ArrayCollection([PlatformConstants.AWS_LINUX.toLowerCase(),PlatformConstants.UBUNTU.toLowerCase()]);
		
		private var _data:Object;
		public var name:String;
		public var description:String;
		
		public var availablePlatforms:ArrayCollection = new ArrayCollection();
		
		public function PuppetModule(data:Object)
		{
			_data = data;
			name = data.name;
			description = data.description;
		}
		
		public function get puppetClass():PuppetClass
		{
			var classObj:Object= new Object();
			var pClass:PuppetClass;
			classObj.name = name;
			classObj.version = "1.2.0";
			classObj.long_description = description;
			classObj.platforms = {
				amazon: "1.0",
				ubuntu: "1.0",
				centos: "1.0"
			};
			pClass = new PuppetClass(classObj);
			return pClass;
		}
		
		public function toObject():Object
		{
			return {
				name: name, 
				description: description,
				puppet_type: "module"
			};
		}
	}
}