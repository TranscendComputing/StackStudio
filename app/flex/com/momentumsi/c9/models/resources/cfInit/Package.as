package com.momentumsi.c9.models.resources.cfInit
{
	import mx.collections.ArrayCollection;

	[Bindable]
	public class Package
	{	
		public var packageManager:String;
		public var install:String;
		public var versions:ArrayCollection = new ArrayCollection();
		//Selected property used for display purposes
		public var selected:Boolean;
		
		public function Package(packageManager:String=null, install:String=null, versions:Array=null, selected:Boolean=true)
		{
			this.packageManager = packageManager;
			this.install = install;
			this.versions = new ArrayCollection(versions);
			this.selected = selected;
		}
	}
}