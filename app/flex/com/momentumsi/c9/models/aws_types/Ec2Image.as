package com.momentumsi.c9.models.aws_types
{
	import com.momentumsi.c9.representers.RepresenterBase;
	
	import mx.collections.ArrayCollection;

	[Bindable]
	public class Ec2Image extends RepresenterBase
	{	
		public static const S3_DEVICE_TYPE:String = "s3";
		public static const EBS_DEVICE_TYPE:String = "ebs";
		
		public function Ec2Image(data:Object)
		{
			super(data);
		}
		
		
		public function get  imageId():String
		{
			return data.id;
		}
		
		public function get imageLocation():String
		{
			return data.location;
		}
		
		public function get imageState():String
		{
			return data.state;
		}
		
		public function get ownerId():String
		{
			return data.owner_id;
		}
		
		public function get isPublic():Boolean
		{
			return data.is_public;
		}
		
		public function get architecture():String
		{
			if(data.architecture == "i386")
			{
				return "32-bit"; 
			}else if(data.architecute == "x86_64"){
				return "64-bit";
			}else{
				return data.architecute;
			}
		}
		
		public function get type():String
		{
			return data.type;
		}
		
		public function get kernelId():String
		{
			return data.kernel_id;
		}
		
		public function get ramdiskId():String
		{
			return data.ramdisk_id;
		}
		
		public function get ownerAlias():String
		{
			return data.owner_alias;
		}
		
		public function get name():String
		{
			return data.name;
		}
		
		public function get description():String
		{
			if(data.description)
			{
				return data.description;
			}else{
				return "No Description";
			}
				
		}
		
		public function get rootDeviceType():String
		{
			if(data.root_device_type == "instance-store")
			{
				return S3_DEVICE_TYPE;
			}else{
				return data.root_device_type;	
			}
		}
		
		public function get rootDeviceName():String
		{
			return data.root_device_name;
		}
		
		public function get blockDeviceMappings():BlockDeviceMapping
		{
			var mappings:ArrayCollection = new ArrayCollection(data.block_device_mapping as Array);
			var firstMapping:BlockDeviceMapping = new BlockDeviceMapping(mappings.getItemAt(0));
			return firstMapping;
		}
		
		public function get virtualizationType():String
		{
			return data.virtualizationType;
		}
		
		public function get tagSet():Object
		{
			return data.tags;
		}
		
		public function get hypervisor():String
		{
			return data.hypervisor;
		}
		
		public function get platform():String
		{
			if(data.platform == null)
			{
				return "Linux";
			}else{
				return "Windows";
			}
		}
		
		
	}
}