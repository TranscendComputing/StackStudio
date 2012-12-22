package com.momentumsi.c9.models.resources
{
	import com.momentumsi.c9.constants.ResourceType;
	import com.momentumsi.c9.models.Element;
	import com.momentumsi.c9.models.ResourceElement;
	import com.momentumsi.c9.utils.IntrinsicFunctionUtil;
	
	import flash.events.Event;
	
	import mx.collections.ArrayCollection;
	import mx.core.mx_internal;
	import mx.utils.StringUtil;
	
	[Bindable]
	public class ElasticBeanstalkEnvironment extends ResourceElement
	{		
		private static const NOTIF_ENDPOINT_OPTION:String = "Notification Endpoint";
		private static const NOTIF_PROTOCOL_OPTION:String = "Notification Protocol";
		private static const TOPICS_NAMESPACE:String = "aws:elasticbeanstalk:sns:topics";		
		private static const INSTANCE_TYPE_OPTION:String = "InstanceType";
		private static const KEY_NAME_OPTION:String = "EC2KeyName"; 
		private static const LAUNCH_CONFIG_NAMESPACE:String = "aws:autoscaling:launchconfiguration";
		private static const APP_HEALTH_CHECK_OPTION:String = "Application Healthcheck URL";
		private static const BEAN_APP_NAMESPACE:String = "aws:elasticbeanstalk:application";
		
		private var _applicationName:Object = new Object();
		private var _optionSettings:ArrayCollection = new ArrayCollection();
		private var _optionsToRemove:ArrayCollection = new ArrayCollection();
		public var cname:String;
		public var solutionStackName:String;
		public var templateName:String;
		public var versionLabel:String;
		public var description:String;
		
		public function ElasticBeanstalkEnvironment(element:Element=null)
		{
			super(element);
			elementType = ResourceType.BEANSTALK_ENV;
			
			_applicationName = _resourceProperties.ApplicationName;
			_optionSettings = new ArrayCollection(_resourceProperties.OptionSettings as Array);
			_optionsToRemove = new ArrayCollection(_resourceProperties.OptionsToRemove as Array);
			cname = _resourceProperties.CNAMEPrefix;
			solutionStackName = _resourceProperties.SolutionStackName;
			templateName = _resourceProperties.TemplateName;
			versionLabel = _resourceProperties.VersionLabel;
			description = _resourceProperties.Description;
		}
		
		public function get applicationName():String 
		{
			if(_applicationName != null && _applicationName.Ref != null)
			{
				return _applicationName.Ref;
			}else{
				return String(_applicationName);
			}
		}
		
		public function set applicationName(value:String):void 
		{
			if(_applicationName == null)
			{
				_applicationName = new Object();
			}
			_applicationName.Ref = value;
		}
		
		public function get keyName():Object 
		{
			for each(var option:Object in _optionSettings)
			{
				if(option.OptionName == KEY_NAME_OPTION)
				{
					//Some items added to comboboxes are given a mx_internal_uid, this must be removed
					if(!(option.Value is String))
					{
						delete option.Value.mx_internal_uid;
					}
					return option.Value;
				}
			}
			return null;
		}
		
		public function set keyName(value:Object):void
		{
			if(value == null)
			{
				removeCurrentOptionSetting("OptionName", KEY_NAME_OPTION);
				return;
			}

			for each(var option:Object in _optionSettings)
			{
				if(option.OptionName == KEY_NAME_OPTION)
				{
					//Key pairs are returned as objects with a name property.  Or, they are a referenced parameter
					if(value.name)
					{
						value = value.name;
					}
					option.Value = value;
					return;
				}
			}
			var newOption:Object = {
				Namespace: LAUNCH_CONFIG_NAMESPACE,
				OptionName: KEY_NAME_OPTION,
				Value: value
			};
			_optionSettings.addItem(newOption);
			dispatchEvent(new Event("keyNameUpdated"));
		}
		
		public function get instanceType():String
		{
			for each(var option:Object in _optionSettings)
			{
				if(option.OptionName == INSTANCE_TYPE_OPTION)
				{
					return option.Value;
				}
			}
			return null;
		}

		public function set instanceType(value:String):void
		{
			if(StringUtil.trim(value) == "")
			{
				removeCurrentOptionSetting("OptionName", INSTANCE_TYPE_OPTION);
			}else{
				for each(var option:Object in _optionSettings)
				{
					if(option.OptionName == INSTANCE_TYPE_OPTION)
					{
						option.Value = value;
						return;
					}
				}
				var newOption:Object = {
					Namespace: LAUNCH_CONFIG_NAMESPACE,
					OptionName: INSTANCE_TYPE_OPTION,
					Value: value
				};
				_optionSettings.addItem(newOption);
			}
		}
		
		public function get email():String
		{
			for each(var option:Object in _optionSettings)
			{
				if(option.OptionName == NOTIF_ENDPOINT_OPTION)
				{
					return option.Value;
				}
			}
			return null
		}

		public function set email(value:String):void
		{
			if(StringUtil.trim(value) == "")
			{
				removeCurrentOptionSetting("Namespace", TOPICS_NAMESPACE);
			}else{
				for each(var option:Object in _optionSettings)
				{
					if(option.OptionName == NOTIF_ENDPOINT_OPTION)
					{
						option.Value = value;
						return;
					}
				}
				var newEmailOption:Object = {
					Namespace: TOPICS_NAMESPACE,
					OptionName: NOTIF_ENDPOINT_OPTION,
					Value: value
				};
				var newProtocolOption:Object = {
					Namespace: TOPICS_NAMESPACE,
					OptionName: NOTIF_PROTOCOL_OPTION,
					Value: "email"
				};
				_optionSettings.addItem(newEmailOption);
				_optionSettings.addItem(newProtocolOption);
			}
		}
		
		public function get appHealthCheck():String
		{
			for each(var option:Object in _optionSettings)
			{
				if(option.OptionName == APP_HEALTH_CHECK_OPTION)
				{
					return option.Value;
				}
			}
			return null
		}
		
		public function set appHealthCheck(value:String):void
		{
			if(StringUtil.trim(value) == "")
			{
				removeCurrentOptionSetting("OptionName", APP_HEALTH_CHECK_OPTION);
			}else{
				for each(var option:Object in _optionSettings)
				{
					if(option.OptionName == APP_HEALTH_CHECK_OPTION)
					{
						option.Value = value;
						return;
					}
				}
				var newOption:Object = {
					Namespace: BEAN_APP_NAMESPACE,
					OptionName: APP_HEALTH_CHECK_OPTION,
					Value: value
				};
	
				_optionSettings.addItem(newOption);
			}
		}
		
		override public function get attributes():Object
		{
			var props:Object = new Object();
			
			props.ApplicationName = _applicationName;
			if(cname)
			{
				props.CNAMEPrefix = cname;
			}
			var option:Object;
			if(_optionSettings.length > 0)
			{
				var optionSettingsArray:Array = new Array();
				for each(option in _optionSettings)
				{
					optionSettingsArray.push(option);
				}
				props["OptionSettings"] = optionSettingsArray;
			}
			if(_optionsToRemove.length > 0)
			{
				var optionSettingsToRemoveArray:Array = new Array();
				for each(option in _optionsToRemove)
				{
					optionSettingsToRemoveArray.push(option);
				}
				props["OptionsToRemove"] = optionSettingsToRemoveArray;
			}
			if(solutionStackName)
			{
				props.SolutionStackName = solutionStackName;
			}
			if(templateName)
			{
				props.TemplateName = templateName;
			}
			if(versionLabel)
			{
				props.VersionLabel = versionLabel;
			}
			if(description)
			{
				props.Description = description;
			}
			
			return props;
		}
		
		private function removeCurrentOptionSetting(key:String, value:String):void
		{
			var option:Object;
			var copyOfOptions:ArrayCollection = new ArrayCollection();
			copyOfOptions.addAll(_optionSettings);

			for each(option in copyOfOptions)
			{
				if(option[key] == value)
				{
					_optionSettings.removeItemAt(_optionSettings.getItemIndex(option));
				}
			}
		}
		
		[Bindable(event="keyNameUpdated")]
		public function get keyNameDisplay():String
		{
			return IntrinsicFunctionUtil.toDisplay(keyName);
		}
	}
}