package com.momentumsi.c9.representers
{
	import com.momentumsi.c9.utils.Helpers;

	[Bindable]
	public class DbSnapshotRepresenter extends RepresenterBase
	{
		public function DbSnapshotRepresenter(data:Object)
		{
			super(data);
		}
		
		public function get id():String 
		{
			return data.id;
		}
		
		public function get allocatedStorage():String 
		{
			return data.allocated_storage;
		}
		
		public function get availabilityZone():String 
		{
			return data.availability_zone;
		}
		
		public function get instanceId():String 
		{
			return data.instance_id;
		}
		
		public function get engine():String 
		{
			return data.engine;
		}
		
		public function get engineVersion():String 
		{
			return data.engine_version;
		}
		
		public function get masterUsername():String 
		{
			return data.master_username;
		}
		
		public function get port():String 
		{
			return data.port;
		}
		
		public function get state():String 
		{
			return data.state;
		}
		
		public function get instanceCreatedAt():String 
		{
			var dateString:String = data.instance_created_at; 
			if(dateString != null)
			{
				return dateFormatter.format(Helpers.formatDate(dateString));
			}else{
				return "Unavailable";
			}
		}
		
		public function get type():String
		{
			return data.type;
		}
		
		public function isAvailable():Boolean
		{
			if(state == "available")
			{
				return true; 
			}else{
				return false;
			}
		}
		
	}
}