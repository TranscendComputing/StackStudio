package com.momentumsi.c9.models.resources
{
	import com.momentumsi.c9.constants.ResourceType;
	import com.momentumsi.c9.models.Element;
	import com.momentumsi.c9.models.ProjectVersion;
	import com.momentumsi.c9.utils.IntrinsicFunctionUtil;
	import com.momentumsi.c9.utils.VectorUtil;
	
	import flash.events.Event;
	import flash.events.EventDispatcher;
	import flash.events.IEventDispatcher;
	
	/**
	*This class is used for representing the compute object or autoscale group,
	* autoscale launch config, and autoscale trigger objects in the compute wizard
	**/  
	
	[Bindable]	
	public class ComputeWizardObjectRepresenter extends EventDispatcher
	{
		public static const NO_ELASTICITY:String = "None";
		public static const FIXED_ARRAY:String = "Fixed Array";
		public static const AUTO_RECOVERY:String = "Auto Recovery";
		public static const AUTO_SCALE:String = "Auto Scale";
		
		public var computeInstance:Ec2Instance;
		public var launchConfiguration:ASLaunchConfiguration;
		public var autoScalingGroup:ASGroup;
		public var trigger:ASTrigger;
		
		private var _imageId:Object = new Object();
		private var _keyName:Object = new Object();
		private var _instanceType:Object = new Object();
		private var _securityGroups:Array = new Array();
		private var _userdata:Object = new Object();
		private var _name:String = new String();
		private var _description:String = new String();
		private var _metadata:Object = new Object();
		private var _dependsOn:String;
		private var _maxSize:Object;
		private var _minSize:Object;
		private var _desiredCapacity:Object;
		
		/**
		 * Contstructor for ComputeWizardObjectRepresenter.
		 * 
		 * @element Pass Element object to grab properties from
		 * @version Pass ProjectVersion in order to find secondary elements
		 * 
		 * */
		public function ComputeWizardObjectRepresenter(element:Element, version:ProjectVersion)
		{
			if(element.elementType == ResourceType.AS_GROUP)
			{
				var holder:Element;
				autoScalingGroup = new ASGroup(element);
				if(autoScalingGroup.launchConfigurationName is String){
					holder = version.getElementByName(String(autoScalingGroup.launchConfigurationName));
				}else{
					holder = version.getElementByName(autoScalingGroup.launchConfigurationName["Ref"]);
				}					
				launchConfiguration = new ASLaunchConfiguration(holder);
				holder = version.getElementByReference(ResourceType.AS_TRIGGER, "AutoScalingGroupName", autoScalingGroup.name);
				if(holder != null)
				{
					trigger = new ASTrigger(holder);
				}
				
				_imageId = launchConfiguration.imageId;
				_keyName = launchConfiguration.keyName;
				_instanceType = launchConfiguration.instanceType;
				_securityGroups = launchConfiguration.securityGroups;
				_userdata = launchConfiguration.userData;
				_name = autoScalingGroup.name;
				_metadata = launchConfiguration.metadata;
				_minSize = autoScalingGroup.minSize;
				_maxSize = autoScalingGroup.maxSize;
				_desiredCapacity = autoScalingGroup.desiredCapacity;
			}else{
				computeInstance = new Ec2Instance(element);
				_imageId = computeInstance.imageId;
				_keyName = computeInstance.keyName;
				_instanceType = computeInstance.instanceType;
				_securityGroups = computeInstance.securityGroups;
				_userdata = computeInstance.userData;
				_name = computeInstance.name;
				_metadata = computeInstance.metadata;
				_dependsOn = computeInstance.dependsOn;
			}
			
			//Remove any white spaces from name (mainly for default name of "New Server"
			_name = _name.replace(/\s/g, "");
		}
		
		/**
		 * Instance (ec2 or launch config) properties getters and setters
		 * */
		
		
		public function get imageId():Object
		{
			return _imageId;
		}
		
		public function set imageId(value:Object):void
		{
			_imageId = value;
			dispatchEvent(new Event("imageIdUpdated"));
		}
		
		
		public function get keyName():Object
		{
			return _keyName;
		}
		
		public function set keyName(value:Object):void
		{
			if(value != null)
			{
				if(value.hasOwnProperty("name"))
				{
					_keyName = value.name;
				}else{
					_keyName = value;
				}
				dispatchEvent(new Event("keyNameUpdated"));
			}
		}
		
		
		public function get instanceType():Object
		{
			return _instanceType;
		}
		
		public function set instanceType(value:Object):void
		{
			if(value != null)
			{
				if(value.hasOwnProperty("id"))
				{
					_instanceType = value.id;
				}else{
					_instanceType = value;
				}
				dispatchEvent(new Event("instanceTypeUpdated"));
			}
		}
		
		public function get securityGroups():Array
		{
			return _securityGroups;
		}
		
		public function set selectedSecurityGroups(value:Vector.<Object>):void
		{
			_securityGroups = new Array();
			var selectedGroups:Array = VectorUtil.toArray(value);
			for(var index:int=0; index < selectedGroups.length; index++)
			{
				if(selectedGroups[index].name)
				{
					_securityGroups.push(selectedGroups[index].name);
				}else{
					_securityGroups.push(selectedGroups[index]);
				}
			}
			dispatchEvent(new Event("securityGroupsUpdated"));
		}
		
		
		public function get userdata():Object
		{
			return _userdata;
		}
		
		public function set userdata(value:Object):void
		{
			_userdata = value;
		}
		
		public function get metadata():Object
		{
			return _metadata;
		}
		
		public function set metadata(value:Object):void
		{
			_metadata = value;
		}
		
		public function get dependsOn():String
		{
			return _dependsOn;
		}
		
		public function set dependsOn(value:String):void
		{
			_dependsOn = value;
		}
		
		public function set cfAuth(value:Object):void
		{
			if(_metadata == null)
			{
				_metadata = new Object();
			}
			_metadata[ResourceType.CF_AUTH] = value;
		}
		
		public function set cfInit(value:Object):void
		{
			if(_metadata == null)
			{
				_metadata = new Object();
			}
			_metadata[ResourceType.CF_INIT] = value;
		}
		
		public function get name():String
		{
			return _name;
		}
		
		public function set name(value:String):void
		{	
			_name = value.replace(/\s/g, "");
		}
		
		/** 
		 * Compute instance --ONLY-- specific settings
		 * */
		
		public function get monitoringEnabled():Boolean
		{
			if(computeInstance)
			{
				return computeInstance.monitoring;
			}else{
				return launchConfiguration.instanceMonitoring;
			}
		}
		
		public function set monitoringEnabled(value:Boolean):void
		{
			if(computeInstance)
			{
				computeInstance.monitoring = value;
			}else
			{
				launchConfiguration.instanceMonitoring = value;	
			}
		}
		
		public function get disableApiTermination():Boolean
		{
			if(computeInstance)
			{
				return computeInstance.disableApiTermination;
			}else{
				return false;
			}
		}
			
		public function set disableApiTermination(value:Boolean):void
		{
			computeInstance.disableApiTermination = value;
		}
		
		/** 
		 * Auto Scale Group Properties getters and setters
		 * */
		
		public function get maxSize():Object
		{
			if(_maxSize)
			{
				return _maxSize;
			}else{
				return "";
			}
		}
		
		public function set maxSize(value:Object):void
		{
			_maxSize = value;
		}
		
		public function get minSize():Object
		{
			if(_minSize)
			{
				return _minSize;
			}else{
				return "";
			}
		}
		
		public function set minSize(value:Object):void
		{
			_minSize = value;
		}
		
		public function set desiredCapacity(value:Object):void
		{
			_desiredCapacity = value;
		}
		
		public function get desiredCapacity():Object
		{
			if(_desiredCapacity != null)
			{
				if(_desiredCapacity.hasOwnProperty("Ref"))
				{
					return "@" + _desiredCapacity["Ref"];
				}else if(_desiredCapacity)
				{
					return _desiredCapacity;
				}else
				{
					return "";
				}
			}else
			{
				return "";
			}
		}

		/** 
		 * Auto Scale Trigger Properties getters and setters
		 * */
		
		
		public function get metricName():Object
		{
			if(trigger)
			{
				return trigger.metricName;
			}else{
				return null;
			}
		}
		
		
		public function set metricName(value:Object):void
		{
			trigger.metricName = value;
		}
		
		
		public function get namespace():Object
		{
			if(trigger)
			{
				return trigger.namespace;
			}else{
				return null;
			}
		}
		
		
		public function set namespace(value:Object):void
		{
			trigger.namespace = "AWS/EC2";
		}
		
		
		public function get dimensions():Object
		{
			if(trigger)
			{
				return trigger.dimensions;
			}else{
				return null;
			}
		}
			
		
		public function set dimensions(value:Object):void
		{
			trigger.dimensions = [{Name: "AutoScalingGroupName", Value: autoScalingGroup.name}];
		}
		
		
		public function get period():Object
		{
			if(trigger)
			{
				return trigger.period
			}else{
				return null;
			}
		}
		
		
		public function set period(value:Object):void
		{
			trigger.period = parseInt(String(value)) * 60;
		}
		
		
		public function get upperBreachScaleIncrement():Object
		{
			if(trigger)
			{
				return trigger.upperBreachScaleIncrement;
			}else{
				return null;
			}
		}
		
		
		public function set upperBreachScaleIncrement(value:Object):void
		{
			trigger.upperBreachScaleIncrement = value;
		}
		
		
		public function get lowerBreachScaleIncrement():Object
		{
			if(trigger)
			{
				return trigger.lowerBreachScaleIncrement;
			}else{
				return null;
			}
		}
		
		
		public function set lowerBreachScaleIncrement(value:Object):void
		{
			trigger.lowerBreachScaleIncrement = value;
		}
		
		
		public function get breachDuration():Object
		{
			if(trigger)
			{
				return trigger.breachDuration;
			}else{
				return null;
			}
		}
		
		
		public function set breachDuration(value:Object):void
		{
			trigger.breachDuration = parseInt(String(value)) * 60;
		}
		
		
		public function get upperThreshold():Object
		{
			if(trigger)
			{
				return trigger.upperThreshold; 
			}else{
				return null;
			}
				
		}
		
		
		public function set upperThreshold(value:Object):void
		{
			trigger.upperThreshold = value;
		}
		
		
		public function get lowerThreshold():Object
		{
			if(trigger)
			{
				return trigger.lowerThreshold; 
			}else{
				return null;
			}
			
		}
		
		
		public function set lowerThreshold(value:Object):void
		{
			trigger.lowerThreshold = value;
		}
		
		
		public function get statistic():Object
		{
			if(trigger)
			{
				return trigger.statistic; 
			}else{
				return null;
			}
			
		}
		
		public function set statistic(value:Object):void
		{
			trigger.statistic = value;
		}
		
		public function get elasticityType():String
		{
			if(_minSize == null)
			{
				return NO_ELASTICITY;
			}else if(_minSize == _maxSize)
			{
				if(_minSize == "1")
				{
					return AUTO_RECOVERY;
				}else{
					return FIXED_ARRAY;
				}
			}else{
				return AUTO_SCALE;
			}
		}
		
		public function getComputeElement():Ec2Instance
		{
			if(computeInstance == null)
			{
				computeInstance = new Ec2Instance();
			}
			computeInstance.name = _name;
			computeInstance.description = _description;
			computeInstance.keyName = _keyName;
			computeInstance.instanceType = _instanceType;
			computeInstance.securityGroups = _securityGroups;
			computeInstance.imageId = _imageId;
			computeInstance.userData = _userdata;
			computeInstance.metadata = metadata;
			computeInstance.dependsOn = _dependsOn;
			return computeInstance;
		}
		
		public function getAutoScaleGroup():ASGroup
		{
			if(autoScalingGroup == null)
			{
				autoScalingGroup = new ASGroup();
			}

			autoScalingGroup.name = _name;
			var launchConfigName:String = _name + "LaunchConfig";
			autoScalingGroup.launchConfigurationName = {Ref: launchConfigName};
			autoScalingGroup.minSize = _minSize;
			autoScalingGroup.maxSize = _maxSize;
			autoScalingGroup.desiredCapacity = _desiredCapacity;
			autoScalingGroup.availabilityZones = new Object();
			autoScalingGroup.availabilityZones[IntrinsicFunctionUtil.GET_AZS] = "";
			return autoScalingGroup;

		}
		
		public function getLaunchConfiguration():ASLaunchConfiguration
		{
			if(launchConfiguration == null)
			{
				launchConfiguration = new ASLaunchConfiguration();
			}
			
			launchConfiguration.name = _name + "LaunchConfig";
			launchConfiguration.keyName = _keyName;
			launchConfiguration.instanceType = _instanceType;
			launchConfiguration.securityGroups = _securityGroups;
			launchConfiguration.imageId = _imageId;
			launchConfiguration.userData = _userdata;
			launchConfiguration.metadata = _metadata;
			launchConfiguration.dependsOn = _dependsOn;
			return launchConfiguration;
		}
		
		public function getTrigger():ASTrigger
		{
			if(trigger == null)
			{
				trigger = new ASTrigger();
			}
			trigger.name = name + "Trigger";
			trigger.autoScalingGroupName = {Ref: _name};
			return trigger;
		}
		
		/**
		 * Display functions
		 * */
		[Bindable(event="imageIdUpdated")]
		public function get imageDisplay():String
		{
			return IntrinsicFunctionUtil.toDisplay(_imageId);
		}
		
		[Bindable(event="instanceTypeUpdated")]
		public function get instanceTypeDisplay():String
		{
			return IntrinsicFunctionUtil.toDisplay(_instanceType);
		}
		
		[Bindable(event="keyNameUpdated")]
		public function get keyNameDisplay():String
		{
			return IntrinsicFunctionUtil.toDisplay(_keyName);
		}
		
		[Bindable(event="securityGroupsUpdated")]
		public function get securityGroupsDisplay():String
		{
			var displayArray:Array = [];
			for(var index:int=0; index < _securityGroups.length; index++)
			{
				displayArray.push(IntrinsicFunctionUtil.toDisplay(_securityGroups[index]));
			}
			return displayArray.join(", ");
		}
	}
}