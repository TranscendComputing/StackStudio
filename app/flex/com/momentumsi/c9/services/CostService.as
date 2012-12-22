package com.momentumsi.c9.services
{	
	import com.momentumsi.c9.models.Element;
	import com.momentumsi.c9.models.Parameter;
	import com.momentumsi.c9.models.ProjectVersion;
	import com.momentumsi.c9.models.resources.ASGroup;
	import com.momentumsi.c9.models.resources.ASLaunchConfiguration;
	import com.momentumsi.c9.models.resources.DbInstance;
	import com.momentumsi.c9.models.resources.EbsVolume;
	import com.momentumsi.c9.models.resources.Ec2Instance;
	import com.momentumsi.c9.models.resources.ElastiCacheCluster;
	import com.momentumsi.c9.models.resources.LoadBalancer;
	
	import flash.events.Event;
	
	import mx.collections.ArrayCollection;
	import mx.effects.easing.Back;
	import mx.rpc.events.ResultEvent;
	
	[Event(name="pricesLoaded", type="flash.events.Event")]
	
	[Bindable]
	public class CostService extends CloudApiService
	{
		private static const HOURS_IN_MONTH:int = 730;
		
		public var projectVersion:ProjectVersion;
		public var prices:ArrayCollection = new ArrayCollection();
		
		public function CostService(rootURL:String=null, destination:String=null)
		{
			super(rootURL, destination);
		}
		
		public function getCloudPrices(cloudId:String):void
		{
			action = "get_cloud_prices";
			addEventListener(ResultEvent.RESULT, getCloudPrices_resultHandler);
			request = {cloud_id: cloudId};
			send();
		}
		
		private function getCloudPrices_resultHandler(event:ResultEvent):void
		{
			prices = new ArrayCollection(result as Array);
			dispatchEvent(new Event("pricesLoaded"));
		}
		
		private function determineValueString(value:Object):String
		{
			var valueString:String = "";
			if(value is String)
			{
				valueString = value.toString();
			}else if(value.hasOwnProperty("Ref"))
			{
				if(projectVersion != null)
				{
					var parameterElement:Element = projectVersion.getElementByName(value.Ref.toString());
					var parameter:Parameter = new Parameter();
					parameter.properties = parameterElement.properties;
					parameter.name = parameterElement.name;
					if(parameter.defaultValue != null && parameter.defaultValue != "")
					{
						valueString = parameter.defaultValue;
					}else
					{
						valueString = "@" + value.Ref.toString();
					}
				}else
				{
					valueString = "@" + value.Ref.toString();
				}
			}
			
			return valueString;
		}
		
		private function isValidNumber(value:Object):Boolean
		{
			var valid:Boolean = false;
			if(value is String)
			{
				if(value.toString() != "" && !isNaN(value.toString()))
				{
					valid = true;
				}	
			}
			
			return valid;
		}
		
		public function generateEc2PriceObject(element:Element):Object
		{		
			var ec2:Ec2Instance = new Ec2Instance(element);
			var ec2PriceObject:Object;
			var resource:String = ec2.name;
			var fee:String = "N/A";
			var monthlyCost:Number = 0;
			var found:Boolean = false;
			
			if(ec2.instanceType == null)
			{
				ec2.instanceType = "m1.small";
			}
			
			var value:String = determineValueString(ec2.instanceType);
			
			for each(var price:Object in prices)
			{
				price = price.price;
				if(!found && price.type == "compute")
				{
					if(value == price.name)
					{
						found = true;
						fee = "$" + (price.effective_price as Number).toFixed(2) + "/" + price.properties.denominator;
						if(price.properties.denominator == "hour")
						{
							monthlyCost = (price.effective_price as Number) * HOURS_IN_MONTH;
						}
					}
				}
			}
			ec2PriceObject = {resource: resource, value: value, fee: fee, monthlyCost: monthlyCost};

			return ec2PriceObject;
		}
		
		public function generateEc2MonitorPriceObject(element:Element):Object
		{
			var ec2:Ec2Instance = new Ec2Instance(element);
			var ec2MonitorPriceObject:Object;
			var resource:String = ec2.name;
			var fee:String = "N/A";
			var monthlyCost:Number = 0;
			var found:Boolean = false;
			
			for each(var price:Object in prices)
			{
				price = price.price;
				if(!found && price.type == "compute")
				{
					if("detailed_monitoring" == price.name)
					{
						found = true;
						fee = "$" + (price.effective_price as Number).toFixed(2) + "/" + price.properties.denominator;
						monthlyCost = (price.effective_price as Number);
					}
				}
			}
			ec2MonitorPriceObject = {resource: resource, value: "Monitoring", fee: fee, monthlyCost: monthlyCost};
			
			return ec2MonitorPriceObject;
		}
		
		public function generateEbsPriceObject(element:Element):Object
		{		
			var ebsPriceObject:Object;
			var resource:String = element.name;
			var value:String = "";
			var fee:String = "N/A";
			var monthlyCost:Number = 0;
			var found:Boolean = false;
			
			if(element.properties["Properties"]["Size"] == null)
			{
				value = "N/A";
			}else
			{
				value = element.properties["Properties"]["Size"].toString() + " GB";
				for each(var price:Object in prices)
				{
					price = price.price;
					if(!found && price.type == "ebs")
					{
						if(element.properties["Properties"]["VolumeType"] == "standard" && "block_storage" == price.name)
						{
							found = true;
							fee = "$" + (price.effective_price as Number).toFixed(2) + "/" + price.properties.denominator;
							if(isValidNumber(element.properties["Properties"]["Size"].toString()))
							{
								monthlyCost = (price.effective_price as Number) * parseInt(element.properties["Properties"]["Size"].toString());
							}	
						}else if(element.properties["Properties"]["VolumeType"] == "io1" && "iops_storage" == price.name)
						{
							found = true;
							fee = "$" + (price.effective_price as Number).toFixed(2) + "/" + price.properties.denominator;
							if(isValidNumber(element.properties["Properties"]["Size"].toString()))
							{
								monthlyCost = (price.effective_price as Number) * parseInt(element.properties["Properties"]["Size"].toString());
							}
						}
					}
				}
			}
			ebsPriceObject = {resource: resource, value: value, fee: fee, monthlyCost: monthlyCost};
			
			return ebsPriceObject;
		}
		
		public function generateEbsIopsPriceObject(element:Element):Object
		{
			var ebsPriceObject:Object;
			var resource:String = element.name;
			var value:String = "";
			var fee:String = "N/A";
			var monthlyCost:Number = 0;
			var found:Boolean = false;
			
			value = element.properties["Properties"]["Iops"].toString() + " IOPS";
			for each(var price:Object in prices)
			{
				price = price.price;
				if(!found && price.type == "ebs")
				{
					if("iops" == price.name)
					{
						found = true;
						fee = "$" + (price.effective_price as Number).toFixed(2) + "/" + price.properties.denominator;
						if(isValidNumber(element.properties["Properties"]["Iops"].toString()))
						{
							monthlyCost = (price.effective_price as Number) * parseInt(element.properties["Properties"]["Iops"].toString());
						}
					}
				}
			}
			ebsPriceObject = {resource: resource, value: value, fee: fee, monthlyCost: monthlyCost};
			
			return ebsPriceObject;
		}
		
		public function generateElcPriceObject(element:Element):Object
		{		
			var elc:ElastiCacheCluster = new ElastiCacheCluster(element);
			var elcPriceObject:Object;
			var resource:String = elc.name;
			var fee:String = "N/A";
			var monthlyCost:Number = 0;
			var found:Boolean = false;

			var instanceType:String = determineValueString(elc.cacheNodeType)
			var value:String = elc.numCacheNodes + " * " + instanceType;
			
			for each(var price:Object in prices)
			{
				price = price.price;
				if(!found && price.type == "elc")
				{
					if(instanceType == price.name)
					{
						found = true;
						var priceNumber:Number = (parseInt(elc.numCacheNodes.toString()) * price.effective_price as Number);
						fee = "$" + priceNumber.toFixed(2) + "/" + price.properties.denominator;
						if(price.properties.denominator == "hour")
						{
							monthlyCost = priceNumber * HOURS_IN_MONTH;
						}
					}
				}
			}
			elcPriceObject = {resource: resource, value: value, fee: fee, monthlyCost: monthlyCost};

			return elcPriceObject;
		}
		
		public function generateRdsPriceObject(element:Element):Object
		{		
			var rds:DbInstance = new DbInstance(element);
			var rdsPriceObject:Object;
			var resource:String = rds.name;
			var fee:String = "N/A";
			var monthlyCost:Number = 0;
			var found:Boolean = false;
			
			var value:String = determineValueString(rds.dbInstanceClass);
			
			for each(var price:Object in prices)
			{
				price = price.price;
				if(!found && price.type == "rds")
				{
					if(value == price.name)
					{
						found = true;
						var multiplier:int = 1;
						if(rds.multiAZ != null && rds.multiAZ == "true")
						{
							multiplier = 2;
						}
						var priceNumber:Number = multiplier * (price.effective_price as Number);
						fee = "$" + priceNumber.toFixed(2) + "/" + price.properties.denominator;
						if(price.properties.denominator == "hour")
						{
							monthlyCost = priceNumber * HOURS_IN_MONTH;
						}
					}
				}
			}
			rdsPriceObject = {resource: resource, value: value, fee: fee, monthlyCost: monthlyCost};
			
			return rdsPriceObject;
		}
		
		public function generateRdsStoragePriceObject(element:Element):Object
		{		
			var rds:DbInstance = new DbInstance(element);
			var rdsStoragePriceObject:Object;
			var resource:String = rds.name;
			var fee:String = "N/A";
			var monthlyCost:Number = 0;
			var found:Boolean = false;
			
			var value:String = determineValueString(rds.allocatedStorage);
			if(value.charAt(0) != "@")
			{
				value = value + " GB";
			}
			
			for each(var price:Object in prices)
			{
				price = price.price;
				if(!found && price.type == "ebs")
				{
					if("block_storage" == price.name)
					{
						found = true;
						var multiplier:int = 1;
						if(rds.multiAZ != null && rds.multiAZ == "true")
						{
							multiplier = 2;
						}
						var priceNumber:Number = multiplier * (price.effective_price as Number);
						fee = "$" + priceNumber.toFixed(2) + "/" + price.properties.denominator;
						if(isValidNumber(rds.allocatedStorage.toString()))
						{
							monthlyCost = priceNumber * parseInt(rds.allocatedStorage.toString());
						}
					}
				}
			}
			rdsStoragePriceObject = {resource: resource, value: value, fee: fee, monthlyCost: monthlyCost};

			return rdsStoragePriceObject;
		}
		
		public function generateElbPriceObject(element:Element):Object
		{		
			var elb:LoadBalancer = new LoadBalancer(element);
			var elbPriceObject:Object;
			var resource:String = elb.name;
			var fee:String = "N/A";
			var monthlyCost:Number = 0;
			var found:Boolean = false;
			
			var value:String = "Load Balancer";
			
			for each(var price:Object in prices)
			{
				price = price.price;
				if(!found && price.type == "elb")
				{
					if("load_balancer" == price.name)
					{
						found = true;
						fee = "$" + (price.effective_price as Number).toFixed(2) + "/" + price.properties.denominator;
						if(price.properties.denominator == "hour")
						{
							monthlyCost = (price.effective_price as Number) * HOURS_IN_MONTH;
						}
					}
				}
			}
			elbPriceObject = {resource: resource, value: value, fee: fee, monthlyCost: monthlyCost};
			
			return elbPriceObject;
		}
		
		public function generateAlarmPriceObject(element:Element):Object
		{		
			var alarmPriceObject:Object;
			var resource:String = element.name;
			var fee:String = "N/A";
			var monthlyCost:Number = 0;
			var found:Boolean = false;
			
			var value:String = "Alarm";
			
			for each(var price:Object in prices)
			{
				price = price.price;
				if(!found && price.type == "alarm")
				{
					if("alarm" == price.name)
					{
						found = true;
						fee = "$" + (price.effective_price as Number).toFixed(2) + "/" + price.properties.denominator;
						monthlyCost = (price.effective_price as Number);
					}
				}
			}
			alarmPriceObject = {resource: resource, value: value, fee: fee, monthlyCost: monthlyCost};
			
			return alarmPriceObject;
		}
		
		public function generateS3PriceObject(element:Element):Object
		{		
			var s3PriceObject:Object;
			var resource:String = element.name;
			var fee:String = "N/A";
			var monthlyCost:Number = 0;
			var found:Boolean = false;
			
			var value:String = "Container";
			
			for each(var price:Object in prices)
			{
				price = price.price;
				if(!found && price.type == "s3")
				{
					if("s3" == price.name)
					{
						found = true;
						fee = "$" + (price.effective_price as Number).toFixed(2) + "/" + price.properties.denominator;
					}
				}
			}
			s3PriceObject = {resource: resource, value: value, fee: fee, monthlyCost: monthlyCost};

			return s3PriceObject;
		}
		
		public function generateAsPriceObject(autoscaleGroup:Element, autoscaleLaunchConfig:Element):Object
		{		
			var asGroup:ASGroup = new ASGroup(autoscaleGroup);
			var asLc:ASLaunchConfiguration = new ASLaunchConfiguration(autoscaleLaunchConfig);
			var asPriceObject:Object;
			var resource:String = asGroup.name;
			var fee:String = "N/A";
			var monthlyCost:Number = 0;
			var found:Boolean = false;
			
			var instanceType:String = determineValueString(asLc.instanceType);
			var instanceCount:String = "";
			if(asGroup.desiredCapacity != null)
			{
				instanceCount = determineValueString(asGroup.desiredCapacity);
			}else
			{
				instanceCount = asGroup.minSize.toString();
			}
			var value:String = instanceCount + " * " + instanceType;
			
			for each(var price:Object in prices)
			{
				price = price.price;
				if(!found && price.type == "compute")
				{
					if(instanceType == price.name)
					{
						found = true;
						var multiplier:int = 1;
						if(isValidNumber(instanceCount))
						{
							multiplier = parseInt(instanceCount);
						}
						var priceNumber:Number = (price.effective_price as Number) * multiplier;
						fee = "$" + priceNumber.toFixed(2) + "/" + price.properties.denominator;
						if(price.properties.denominator == "hour")
						{
							monthlyCost = priceNumber * HOURS_IN_MONTH;
						}
					}
				}
			}
			asPriceObject = {resource: resource, value: value, fee: fee, monthlyCost: monthlyCost};
			
			return asPriceObject;
		}
		
		public function generateAsMonitorPriceObject(autoscaleGroup:Element, autoscaleLaunchConfig:Element):Object
		{
			var asGroup:ASGroup = new ASGroup(autoscaleGroup);
			var asLc:ASLaunchConfiguration = new ASLaunchConfiguration(autoscaleLaunchConfig);
			var asMonitorPriceObject:Object;
			var resource:String = asGroup.name;
			var fee:String = "N/A";
			var monthlyCost:Number = 0;
			var found:Boolean = false;
			
			for each(var price:Object in prices)
			{
				price = price.price;
				if(!found && price.type == "compute")
				{
					if("detailed_monitoring" == price.name)
					{
						found = true;
						fee = "$" + (price.effective_price as Number).toFixed(2) + "/" + price.properties.denominator;
						monthlyCost = (price.effective_price as Number);
					}
				}
			}
			asMonitorPriceObject = {resource: resource, value: "Monitoring", fee: fee, monthlyCost: monthlyCost};
			
			return asMonitorPriceObject;
		}
	}
}
