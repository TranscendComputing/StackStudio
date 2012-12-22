package com.momentumsi.c9.models.resources
{
	import com.momentumsi.c9.constants.ResourceType;
	import com.momentumsi.c9.models.Element;
	import com.momentumsi.c9.models.ProjectVersion;
	import com.momentumsi.c9.models.ResourceElement;
	
	import mx.collections.ArrayCollection;
	
	import flash.events.Event;
	
	[Bindable]
	public class ElasticBeanstalkApplication extends ResourceElement
	{
		private var _applicationVersions:ArrayCollection = new ArrayCollection();
		private var _configurationsTemplates:ArrayCollection = new ArrayCollection();
		public var description:String;
		
		public function ElasticBeanstalkApplication(element:Element=null)
		{
			super(element);			
			elementType = ResourceType.BEANSTALK_APP;
			
			var obj:Object;
			
			var temps:ArrayCollection = new ArrayCollection(_resourceProperties.ConfigurationTemplates as Array);
			for each(obj in temps)
			{
				_configurationsTemplates.addItem(new ElasticBeanstalkConfigurationTemplate(obj));
			}
			
			var versions:ArrayCollection = new ArrayCollection(_resourceProperties.ApplicationVersions as Array);
			for each(obj in versions)
			{
				_applicationVersions.addItem(new ElasticBeanstalkApplicationVersion(obj)); 
			}
			
			description = _resourceProperties.Description;
		}
		
		public function get configurationTemplates():ArrayCollection
		{
			return _configurationsTemplates;
		}
		
		public function set configurationTemplates(value:ArrayCollection):void			
		{
			_configurationsTemplates = value;
		}
		
		public function get applicationVersions():ArrayCollection 
		{
			return _applicationVersions;
		}
		
		public function set applicationVersions(value:ArrayCollection):void 
		{
			_applicationVersions = value;
		}
		
		public function addAppVersion(version:ElasticBeanstalkApplicationVersion):void
		{
			_applicationVersions.removeAll();
			_applicationVersions.addItem(version);
		}
		
		public function addConfigTemplate(template:ElasticBeanstalkConfigurationTemplate):void
		{
			_configurationsTemplates.removeAll();
			_configurationsTemplates.addItem(template);
		}
				
		override public function get attributes():Object
		{
			var props:Object = new Object();
			var objConverter:Object;
			
			if(_configurationsTemplates.length > 0)
			{
				var configTemplates:Array = new Array();				
				for each(var temp:ElasticBeanstalkConfigurationTemplate in _configurationsTemplates)
				{
					objConverter = temp.toObject();
					configTemplates.push(objConverter);
				}
				props["ConfigurationTemplates"] = configTemplates;
					
			}

			var appVersions:Array = new Array();
			for each(var version:ElasticBeanstalkApplicationVersion in _applicationVersions)
			{
				objConverter = version.toObject();
				appVersions.push(objConverter);
			}
			props["ApplicationVersions"] = appVersions;

			if(description)
			{
				props["Description"] = description;
			}
			return props;
		}
		
		public function removeApplicationResources(version:ProjectVersion):void
		{
			removeEnvironmentFromResources(version);
			version.deleteElementByName(name);
		}
		
		private function removeEnvironmentFromResources(version:ProjectVersion):void
		{
			version.deleteElementByReference(ResourceType.BEANSTALK_ENV, "ApplicationName", name);
			version.dispatchEvent(new Event(ProjectVersion.REFRESH));
		}
	}
}
