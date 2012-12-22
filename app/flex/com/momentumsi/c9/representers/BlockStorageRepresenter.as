package com.momentumsi.c9.representers
{
	import com.momentumsi.c9.utils.Helpers;
	
	import spark.formatters.DateTimeFormatter;
	[Bindable]
	public class BlockStorageRepresenter extends RepresenterBase
	{		
		public function BlockStorageRepresenter(data:Object)
		{
			super(data);
			dateFormatter.dateTimePattern = "MM/dd/yyyy hh:mm:ss a";
		}
		
		public function get name():String
		{
			return data.name || "-";
		}
		
		public function get description():String
		{
			return data.description || "-";
		}
		
		public function get id():String
		{
			return data.id;

		}
		
		public function get stackName():String
		{
			if(data.hasOwnProperty("stack_name"))
				return data.stack_name;
			else
				return new String;
			
		}
		
		public function get stackResourceName():String
		{
			if(data.hasOwnProperty("stack_resource_name"))
				return data.stack_resource_name;
			else
				return new String;		
		}
		
		public function get attachedAt():String
		{
			if(data.hasOwnProperty("attached_at"))
				return dateFormatter.format(Helpers.formatDate(data.attached_at));
			else
				return new String;	
		}
		
		public function get availabilityZone():String
		{
			if(data.hasOwnProperty("availability_zone"))
				return data.availability_zone;
			else
				return new String;
		}
		
		public function get zoneId():String
		{
			if(data.hasOwnProperty("zone_id"))
				return data.zone_id;
			else
				return new String;
		}
		
		public function get deleteOnTermination():String
		{
			if(data.hasOwnProperty("delete_on_termination"))
				return data.delete_on_termination;
			else
				return new String;	
		}
		
		public function get device():String
		{
			if(data.hasOwnProperty("device"))
				return data.device;
			else
				return new String;	
		}
		
		public function get serverId():String
		{
			return data.server_id;
		}
		
		public function get size():String
		{
			return data.size;
		}
		
		public function get snapshotId():String
		{
			if(data.hasOwnProperty("snapshot_id") && data.snapshot_id != null)
				return data.snapshot_id;
			else
				return new String;
		}
		
		public function get state():String
		{
			return data.state;
		}
		
		public function get type():String
		{
			return data.type;
		}
		
		public function get iops():String
		{
			return data.iops
		}
	}
}