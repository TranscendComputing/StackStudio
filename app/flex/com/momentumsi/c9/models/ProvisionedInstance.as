package com.momentumsi.c9.models
{
	import com.momentumsi.c9.constants.ResourceType;
	import com.momentumsi.c9.representers.CloudFormationStackEventRepresenter;
	
	import flash.events.Event;
	import flash.events.EventDispatcher;
	import flash.geom.Point;

	[Bindable]
	public class ProvisionedInstance extends EventDispatcher
	{
		public var id:String;
		public var resourceId:String; // CF logical resource id
		public var instanceId:String; // CF physical resource id
		public var type:String
		private var _properties:Object;
		private var _status:String = LAUNCHING;
		private var _currentStackState:String;
		
		public static const RUNNING:String = "running";
		public static const AVAILABLE:String = "available";
		public static const LAUNCHING:String = "launching";
		public static const SHUTTING_DOWN:String = "shutting-down";
		public static const DELETING:String = "deleting";
		public static const FAILED_LAUNCH:String = "failed launch";
		public static const TERMINATED:String = "terminated";
		public static const FAILED_SHUT_DOWN:String = "failed shut-down";
		
		public function ProvisionedInstance(type:String, resourceId:String=null, id:String=null, properties:Object=null, instanceId:String=null)
		{
			this.id = id;
			this.type = type;
			this._properties = properties;
			this.resourceId = resourceId;
			if(instanceId != "undefined")
			{
				this.instanceId = instanceId;
			}
		}
		
		public static function buildProvisionedInstance(inst:Object):ProvisionedInstance
		{
			var newInst:ProvisionedInstance;
			
			newInst = new ProvisionedInstance(inst["instance_type"], inst["resource_id"], inst["id"], inst["properties"], inst["instance_id"]);
			
			return newInst;
		}
		
		public function get roles():Array
		{
			if(properties != null)
			{
				return properties.roles as Array;
			}else{
				return [];
			}
		}
		
		public function get platform():String
		{
			if(properties != null)
			{
				return String(properties.platform);
			}else{
				return new String();
			}
		}
		
		public function update(instance:Object):void
		{
			this.type = instance["instance_type"];
			this.resourceId = instance["resource_id"];
			this.id = instance["id"];
			this.properties = instance["properties"];
			this.instanceId = instance["instance_id"];
		}
		
		public function get coordinates():Point
		{
			if(_properties["coordinates"] != null)
			{
				if(_properties["coordinates"]["x"] != null && _properties["coordinates"]["y"] != null)
				{
					return new Point(_properties["coordinates"]["x"], _properties["coordinates"]["y"]);
				}
			}
			return new Point;
		}
		
		public function get currentStackState():String
		{
			return _currentStackState;
		}
		
		[Bindable(event="updatedStatus")]
		public function get status():String
		{
			return _status;
		}
		
		public function set status(value:String):void
		{
			_currentStackState = value;
			switch(value)
			{
				case CloudFormationStackEventRepresenter.CREATE_COMPLETE:
					_status = RUNNING;
					break;
				case CloudFormationStackEventRepresenter.CREATE_IN_PROGRESS:
					_status = LAUNCHING;
					break;
				case CloudFormationStackEventRepresenter.DELETE_IN_PROGRESS:
				case CloudFormationStackEventRepresenter.ROLLBACK_IN_PROGRESS:
					_status = SHUTTING_DOWN;
					break;
				case CloudFormationStackEventRepresenter.ROLLBACK_COMPLETE:
				case CloudFormationStackEventRepresenter.DELETE_COMPLETE:
					_status = TERMINATED;
					break;
				case CloudFormationStackEventRepresenter.CREATE_FAILED:
					_status = FAILED_LAUNCH;
					break;
				case CloudFormationStackEventRepresenter.DELETE_FAILED:
				case CloudFormationStackEventRepresenter.ROLLBACK_FAILED:
					_status = FAILED_SHUT_DOWN;
					break;
			}
			dispatchEvent(new Event("updatedStatus"));
		}
		
		public function set properties(value:Object):void
		{
			_properties["Properties"] = value;
		}
		
		public function get properties():Object
		{
			var props:Object = _properties.Properties;
			if(props != null && _properties.roles != null)
			{
				props.roles = _properties.roles; 
			}
			return props;
		}
		
		public function toObject():Object
		{
			return {
				provisioned_instance:{
					instance_type: type,
					instance_id: instanceId, 
					resource_id: resourceId,
					properties: _properties
				}
			};
		}

	}
}