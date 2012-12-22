package com.momentumsi.c9.representers
{
	import mx.collections.ArrayCollection;
	import mx.utils.StringUtil;
	
	[Bindable]
	public class AutoScaleRepresenter extends RepresenterBase
	{
		public var zonesCollection:ArrayCollection;
		public var instancesCollection:ArrayCollection;
		public var loadBalancersCollection:ArrayCollection;
		public var suspendedProcessCollection:ArrayCollection;
		public var enabledMetricsCollection:ArrayCollection;
		public function AutoScaleRepresenter(data:Object)
		{
			if(data.AutoScalingGroupName != null)
			{
				super(data);
				zonesCollection = new ArrayCollection(data.AvailabilityZones as Array);
				instancesCollection = new ArrayCollection(data.Instances as Array);
				loadBalancersCollection = new ArrayCollection(data.LoadBalancerNames as Array);
				suspendedProcessCollection = new ArrayCollection(data.SuspendedProcesses as Array);
				enabledMetricsCollection = new ArrayCollection(data.EnabledMetrics as Array);
			}
		}
		
		public function get name():String
		{
			return data.AutoScalingGroupName;
		}
		
		public function get availabilityZones():String
		{
			var zones:Array = data.AvailabilityZones;
			return zones.join(",\n");
		}
		
		public function get enabledMetrics():String
		{
			var metrics:Array = [];
			for each(var metric:Object in enabledMetricsCollection)
			{
				var displayString:String = metric.Metrics + " : " + metric.Granularity;
				metrics.push(displayString);
			}
			return metrics.join(",\n");
		}
		
		public function get instances():String
		{
			var instances:Array = [];
			for each(var instance:Object in instancesCollection)
			{
				var displayString:String = instance.InstanceId;
				instances.push(displayString);
			}
			return instances.join(",\n");
		}
		
		public function get loadBalancers():String
		{
			var loadBalancers:Array = [];
			for each (var loadBalancer:String in loadBalancersCollection)
			{
				loadBalancers.push(loadBalancer);
			}
			return loadBalancers.join(",\n");
		}
		
		public function get suspendedProcesses():String
		{
			var suspendedProcesses:Array = [];
			for each(var process:Object in suspendedProcessCollection)
			{
				var displayString:String = process.ProcessName;
				suspendedProcesses.push(displayString);
			}
			return suspendedProcesses.join(",\n");
		}
		
		public function get healthCheckType():String
		{
			return data.HealthCheckType;
		}
		
		public function get launchConfigurationName():String
		{
			return data.LaunchConfigurationName;
		}
		
		public function get desiredCapacity():String
		{
			return data.DesiredCapacity;
		}
		
		public function get minSize():String
		{
			return data.MinSize;
		}
		
		public function get maxSize():String
		{
			return data.MaxSize;
		}
		
		public function get vpcZoneIdentifier():String
		{
			if(data.VPCZoneIdentifier == null)
				return "N/A";
			else
				return data.VPCZoneIdentifier;
		}
		
		public function get healthCheckGracePeriod():String
		{
			return data.HealthCheckGracePeriod;
		}
		
		public function get defaultCooldown():String
		{
			return data.DefaultCooldown;
		}
		
		public function get groupArn():String
		{
			return data.AutoScalingGroupARN;
		}
		
	}
}