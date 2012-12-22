package com.momentumsi.c9.models.resources
{
	import com.momentumsi.c9.utils.IntrinsicFunctionUtil;
	
	import flash.events.Event;
	import flash.events.EventDispatcher;
	
	import mx.collections.ArrayCollection;
	import mx.utils.StringUtil;

	[Bindable]
	public class ElasticBeanstalkConfigurationTemplate extends EventDispatcher
	{
		private static const NOTIF_ENDPOINT_OPTION:String = "Notification Endpoint";
		private static const NOTIF_PROTOCOL_OPTION:String = "Notification Protocol";
		private static const TOPICS_NAMESPACE:String = "aws:elasticbeanstalk:sns:topics";		
		private static const INSTANCE_TYPE_OPTION:String = "InstanceType";
		private static const KEY_NAME_OPTION:String = "EC2KeyName"; 
		private static const LAUNCH_CONFIG_NAMESPACE:String = "aws:autoscaling:launchconfiguration";
		private static const APP_HEALTH_CHECK_OPTION:String = "Application Healthcheck URL";
		private static const BEAN_APP_NAMESPACE:String = "aws:elasticbeanstalk:application";
		
		private var _templateName:String;
		private var _description:String;
		private var _optionSettings:ArrayCollection = new ArrayCollection();
		private var _solutionStackName:String;
		
		public function ElasticBeanstalkConfigurationTemplate(data:Object)
		{
			_templateName = data.TemplateName;
			_description = data.Description;
			_optionSettings = new ArrayCollection(data.OptionSettings as Array);
			_solutionStackName = data.SolutionStackName;
		}
		
		public function get templateName():String 
		{
			return _templateName;
		}
		
		public function set templateName(value:String):void 
		{
			_templateName = value;
		}
		
		public function get description():String 
		{
			return _description;
		}
		
		public function set description(value:String):void 
		{
			_description = value;
		}
		
		public function get solutionStackName():String 
		{
			return _solutionStackName;
		}
		
		public function set solutionStackName(value:String):void 
		{
			_solutionStackName = value;
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
			if(StringUtil.trim(value) == "" || StringUtil.trim(value) == "t1.micro")
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
			if(StringUtil.trim(value) == "" || StringUtil.trim(value) == "/")
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
		
		public function toObject():Object
		{
			var returnObj:Object = new Object();
			returnObj.TemplateName = _templateName;
			if(_description)
			{
				returnObj.Description = _description;
			}
			if(_optionSettings.length > 0)
			{
				var settings:Array = new Array();
				for each(var obj:Object in _optionSettings)
				{
					settings.push(obj);
				}
				returnObj.OptionSettings = settings;
			}
			if(_solutionStackName)
			{
				returnObj.SolutionStackName = _solutionStackName;
			}
			
			return returnObj;
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