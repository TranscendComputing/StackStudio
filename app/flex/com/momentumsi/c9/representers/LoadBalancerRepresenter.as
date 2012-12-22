package com.momentumsi.c9.representers
{
	import mx.collections.ArrayCollection;
	import mx.utils.StringUtil;

	[Bindable]
	public class LoadBalancerRepresenter extends RepresenterBase
	{
		public var zonesCollection:ArrayCollection;
		public var listenersCollection:ArrayCollection;
		public var instancesCollection:ArrayCollection;
		public function LoadBalancerRepresenter(data:Object)
		{
			super(data);
			zonesCollection = new ArrayCollection(data.AvailabilityZones as Array);
			listenersCollection = new ArrayCollection(data.ListenerDescriptions as Array);
			instancesCollection = new ArrayCollection(data.Instances as Array);
		}
		
		public function get name():String
		{
			return data.LoadBalancerName;
		}
		
		public function get singleZone():String
		{
			var zones:Array = data.AvailabilityZones;
			return String(zones[0]);
		}
		
		public function get availabilityZones():String
		{
			var zones:Array = data.AvailabilityZones;
			return zones.join(",\n");
		}
		
		public function get dnsName():String
		{
			return data.DNSName;
		}
		
		public function get healthyThreshold():String
		{
			var healthCheck:Object = data.HealthCheck;
			return healthCheck.HealthyThreshold;
		}
		
		public function get interval():String
		{
			var healthCheck:Object = data.HealthCheck;
			return healthCheck.Interval;
		}
		
		public function get target():String
		{
			var healthCheck:Object = data.HealthCheck;
			return healthCheck.Target;
		}
		
		public function get timeout():String
		{
			var healthCheck:Object = data.HealthCheck;
			return healthCheck.Timeout;
		}
		
		public function get unhealthyThreshold():String
		{
			var healthCheck:Object = data.HealthCheck;
			return healthCheck.UnhealthyThreshold;
		}
		
		public function get hostedZoneName():String
		{
			return data.CanonicalHostedZoneName;
		}
		
		public function get hostedZoneId():String
		{
			return data.CanonicalHostedZoneNameID;
		}
		
		public function get instances():String
		{
			var instancesArray:Array = [];
			for each (var instance:String in instancesCollection)
			{
				instancesArray.push(instance);
			}
			return instancesArray.join(",\n");
		}
		
		public function get listenersDisplay():String
		{
			var portConfigDisplay:String = new String();
			var listener:Object;
			var policy:Object;
			for each(var listenerConfig:Object in listenersCollection)
			{
				listener = listenerConfig.Listener;
				portConfigDisplay = portConfigDisplay + listener.LoadBalancerPort + 
					" forwarding to " + listener.InstancePort + 
					" (" + listener.Protocol + ")\n";
				
				var sslString:String = "N/A";
				if(listener.SSLCertificateId != null)
				{
					sslString = listener.SSLCertificateId;
				}
			}
			return StringUtil.trim(portConfigDisplay);
		}
		
		public function get sourceSecurityGroup():String
		{
			var group:Object = data.SourceSecurityGroup;
			return group.GroupName;
		}
		
	}
}