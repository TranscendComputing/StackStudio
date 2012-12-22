package com.momentumsi.c9.models.resources
{
	import com.momentumsi.c9.models.resources.cfInit.File;
	import com.momentumsi.c9.models.resources.cfInit.Package;
	
	import flash.events.EventDispatcher;
	
	import mx.collections.ArrayCollection;
	import mx.events.CollectionEvent;
	import mx.events.CollectionEventKind;
	import mx.events.PropertyChangeEvent;

	[Event(name="collectionChange", type="mx.events.CollectionEvent")]
	
	[Bindable]
	public class CFInit extends EventDispatcher
	{
		public static const COMMAND_KEYS:ArrayCollection = new ArrayCollection([
			{label: "command"},
			{label: "env"},
			{label: "cwd"},
			{label: "test"},
			{label: "ignoreErrors"}
		]);
		
		public static const FILE_KEYS:ArrayCollection = new ArrayCollection([
			{label: "content"},
			{label: "source"},
			{label: "encoding"},
			{label: "group"},
			{label: "owner"},
			{label: "mode"},
			{label: "authentication"}
		]);
		
		public static const GROUP_KEY:String = "gid";
		
		public static const PACKAGES:ArrayCollection = new ArrayCollection([
			{label: "apt"},
			{label: "yum"},
			{label: "rubygems"},
			{label: "python"},
			{label: "rpm"}
		]);
		public static const APT_PACKAGE:String = "apt";
		public static const YUM_PACKAGE:String = "yum";
		public static const RUBYGEMS_PACKAGE:String = "rubygems";
		public static const PYTHON_PACKAGE:String = "python";
		public static const RPM_PACKAGE:String = "rpm";

		public var files:ArrayCollection = new ArrayCollection();
		public var packages:ArrayCollection = new ArrayCollection();
		public var aptPackages:ArrayCollection = new ArrayCollection();
		public var rubygemsPackages:ArrayCollection = new ArrayCollection();
		public var yumPackages:ArrayCollection = new ArrayCollection();
		public var pythonPackages:ArrayCollection = new ArrayCollection();
		public var rpmPackages:ArrayCollection = new ArrayCollection();
		public var services:Object;
		public var commands:Object;
		public var groups:Object;
		public var users:Object;
		
		public function CFInit()
		{
			packages.addEventListener(CollectionEvent.COLLECTION_CHANGE, packageCollection_changeHandler);
			files.addEventListener(CollectionEvent.COLLECTION_CHANGE, filesCollection_changeHandler);
		}
		
		public static function buildCFInit(initObj:Object):CFInit
		{
			var cfInit:CFInit = new CFInit();
			var initConfig:Object = initObj.config;
			if(initConfig != null)
			{
				var item:*;
				var newFile:File;
				for(item in initConfig.files)
				{
					newFile = File.buildFile(item, initConfig.files[item]);
					cfInit.files.addItem(newFile);
				}
				
				var newPackage:Package;
				for(item in initConfig.packages)
				{
					var packageInstalls:Object = initConfig.packages[item]; 
					for(var install:* in packageInstalls)
					{
						cfInit.addPackage(item, install, packageInstalls[install]); 
					}
				}
				
				if(initConfig.hasOwnProperty("services"))
				{
					cfInit.services = initConfig.services;
				}
				if(initConfig.hasOwnProperty("commands"))
				{
					cfInit.commands = initConfig.commands;
				}
				if(initConfig.hasOwnProperty("groups"))
				{
					cfInit.groups = initConfig.groups;
				}
				if(initConfig.hasOwnProperty("users"))
				{
					cfInit.users = initConfig.users;
				}
			}
			return cfInit;
		}
		
		public function addFile(name:String, content:Object=null, source:String=null, mode:int=644, owner:String="root", group:String="root"):void
		{	
			var file:File = new File();
			file.name = name;
			file.content = content;
			file.mode = mode;
			file.owner = owner;				
			file.group = group;
			file.source = source;
			files.addItem(file);
		}
		
		public function updateFile(newFile:File):void
		{
			for each(var file:File in files)
			{
				if(file.name == newFile.name)
				{
					files.setItemAt(newFile, files.getItemIndex(file));
					return;
				}
			}
		}
		
		public function addPackage(type:String, packageName:String, packageVersions:Array):void
		{
			var packageObj:Package = new Package();
			packageObj.packageManager = type;
			packageObj.install = packageName;
			packageObj.versions = new ArrayCollection(packageVersions);
			packages.addItem(packageObj);
		}
		
		public function toJson():Object
		{
			var initObject:Object = new Object();
			initObject["config"] = {};
			if(packages.length > 0)
			{
				initObject["config"]["packages"] = new Object();
				var packFormat:Object;
				for each(var packageItem:Package in packages)
				{
					if(initObject["config"]["packages"][packageItem.packageManager] == null)
					{
						initObject["config"]["packages"][packageItem.packageManager] = new Object();
					}
					initObject["config"]["packages"][packageItem.packageManager][packageItem.install] = packageItem.versions.source;
				}
			}
			if(files.length > 0)
			{
				initObject["config"]["files"] = new Object();
				for each(var file:File in files)
				{
					initObject["config"]["files"][file.name] = file.toJson();
				}
			}
			if(services != null)
			{
				initObject["config"]["services"] = services;
			}
			if(commands != null)
			{
				initObject["config"]["commands"] = commands;
			}
			if(groups != null)
			{
				initObject["config"]["groups"] = groups;
			}
			if(users != null)
			{
				initObject["config"]["users"] = users;
			}
			return initObject;
		}
		
		public function isEmpty():Boolean
		{
			var data:Object = this.toJson();
			if(data.config == {})
			{
				return true;
			}else{
				return false;
			}
		}
		
		private function filesCollection_changeHandler(event:CollectionEvent):void
		{
			//Dispatch event to inform files have been updated
			dispatchEvent(new CollectionEvent(CollectionEvent.COLLECTION_CHANGE));
		}
		
		private function packageCollection_changeHandler(event:CollectionEvent):void
		{
			var packageItem:Package;
			var index:int;
			var packageIndex:int;
			if(event.kind == CollectionEventKind.ADD)
			{
				for(index=0; index < event.items.length; index++)
				{
					packageItem = event.items[index] as Package;
					switch(packageItem.packageManager)
					{
						case APT_PACKAGE:
							aptPackages.addItem(packageItem);
							break;
						case YUM_PACKAGE:
							yumPackages.addItem(packageItem);
							break;
						case PYTHON_PACKAGE:
							pythonPackages.addItem(packageItem);
							break;
						case RUBYGEMS_PACKAGE:
							rubygemsPackages.addItem(packageItem);
							break;
						case RPM_PACKAGE:
							rpmPackages.addItem(packageItem);
							break;
					}
				}
			}else if(event.kind == CollectionEventKind.REMOVE)
			{
				for(index=0; index < event.items.length; index++)
				{
					packageItem = event.items[index] as Package;
					switch(packageItem.packageManager)
					{
						case APT_PACKAGE:
							packageIndex = aptPackages.getItemIndex(packageItem);
							aptPackages.removeItemAt(packageIndex);
							break;
						case YUM_PACKAGE:
							packageIndex = yumPackages.getItemIndex(packageItem);
							yumPackages.removeItemAt(packageIndex);
							break;
						case PYTHON_PACKAGE:
							packageIndex = pythonPackages.getItemIndex(packageItem);
							pythonPackages.removeItemAt(packageIndex);
							break;
						case RUBYGEMS_PACKAGE:
							packageIndex = rubygemsPackages.getItemIndex(packageItem);
							rubygemsPackages.removeItemAt(packageIndex);
							break;
						case RPM_PACKAGE:
							packageIndex = rpmPackages.getItemIndex(packageItem);
							rpmPackages.removeItemAt(packageIndex);
							break;
					}
				}
			}else if(event.kind == CollectionEventKind.REPLACE)
			{
				var propertyChangeEvent:PropertyChangeEvent = event.items[0] as PropertyChangeEvent;
				var newPackageItem:Package = propertyChangeEvent.newValue as Package;
				var oldPackageItem:Package = propertyChangeEvent.oldValue as Package;
				switch(oldPackageItem.packageManager)
				{
					case APT_PACKAGE:
						packageIndex = aptPackages.getItemIndex(oldPackageItem);
						aptPackages.setItemAt(newPackageItem, packageIndex);
						break;
					case YUM_PACKAGE:
						packageIndex = yumPackages.getItemIndex(oldPackageItem);
						yumPackages.setItemAt(newPackageItem, packageIndex);
						break;
					case PYTHON_PACKAGE:
						packageIndex = pythonPackages.getItemIndex(oldPackageItem);
						pythonPackages.setItemAt(newPackageItem, packageIndex);
						break;
					case RUBYGEMS_PACKAGE:
						packageIndex = rubygemsPackages.getItemIndex(oldPackageItem);
						rubygemsPackages.setItemAt(newPackageItem, packageIndex);
						break;
					case RPM_PACKAGE:
						packageIndex = rpmPackages.getItemIndex(oldPackageItem);
						rpmPackages.setItemAt(newPackageItem, packageIndex);
						break;
				}
			}
			
			//Dispatch event to inform packages have been updated
			dispatchEvent(new CollectionEvent(CollectionEvent.COLLECTION_CHANGE));
		}
	}
}