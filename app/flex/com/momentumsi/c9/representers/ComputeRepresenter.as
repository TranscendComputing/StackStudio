package com.momentumsi.c9.representers
{
	import com.momentumsi.c9.models.aws_types.BlockDeviceMapping;
	
	import mx.collections.ArrayCollection;
	
	[Bindable]
	public class ComputeRepresenter extends RepresenterBase
	{
		public var securityGroupsCollection:ArrayCollection;
		
		public function ComputeRepresenter(data:Object)
		{
			if(data != null)
			{
				super(data);
				securityGroupsCollection = new ArrayCollection(data.groups as Array);
			}
		}
		
		public function get name():String
		{
			return data.name;
		}
		
		public function get description():String
		{
			return data.description;
		}
		
		public function get id():String
		{
			return data.id;
		}
		
		public function get availabilityZone():String
		{
			return data.availability_zone;
		}
		
		public function get dnsName():String
		{
			return data.dns_name;
		}
		
		public function get securityGroups():String
		{
			var securityGroups:Array = [];
			for each(var group:String in securityGroupsCollection)
			{
				var displayString:String = group;
				securityGroups.push(displayString);
			}
			return securityGroups.join(",\n");
		}
		
		public function get flavorId():String
		{
			return data.flavor_id;
		}
		
		public function get imageId():String
		{
			return data.image_id;
		}
		
		public function get imageName():String
		{
			return data.image_name;
		}
		
		public function get kernelId():String
		{
			return data.kernel_id;
		}
		
		public function get keyName():String
		{
			return data.key_name;
		}
		
		public function get monitoring():String
		{
			return data.monitoring;
		}
		
		public function get privateDnsName():String
		{
			return data.private_dns_name;
		}
		
		public function get privateIpAddress():String
		{
			return data.private_ip_address;
		}
		
		public function get publicIpAddress():String
		{
			return data.public_ip_address;
		}
		
		public function get ramdiskId():String
		{
			return data.ramdisk_id;
		}
		
		public function get rootDeviceName():String
		{
			return data.root_device_name;
		}
		
		public function get rootDeviceType():String
		{
			if(data.root_device_type == "instance-store")
			{
				return "S3";
			}else{
				return data.root_device_type;
			}
		}
		
		public function get state():String
		{
			return data.state;
		}
		
		public function get stateReason():String
		{
			return data.state_reason;
		}
		
		public function get platform():String
		{
			if(data.platform)
			{
				return data.platform;
			}else{
				return "Windows";
			}
			
		}
		
		public function get virtualizationType():String
		{
			return data.virtualization_type;
		}
		
		public function set publicIpAddress(ip:String):void
		{
			data.public_ip_address = ip; 
		}
		
		public function get architecture():String
		{
			if(data.architecture == "i386")
			{
				return "32-bit";
			}else if(data.architecture == "x86_64")
			{
				return "64-bit";
			}else{
				return data.architecture;
			}
		}
		
		public function get blockDeviceMappings():BlockDeviceMapping
		{
			var mappings:ArrayCollection = new ArrayCollection(data.block_device_mapping as Array);
			var firstMapping:BlockDeviceMapping = new BlockDeviceMapping(mappings.getItemAt(0));
			return firstMapping;
		}
	}
}