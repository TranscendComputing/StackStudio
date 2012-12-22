package com.momentumsi.c9.models.resources
{
	import com.momentumsi.c9.constants.ResourceType;
	import com.momentumsi.c9.models.Element;
	
	public class ElasticIp extends Element
	{
		[Bindable]
		public var instanceId:Object;
		[Bindable]
		public var domain:Object;
		private var _properties:Object;
		
		public function ElasticIp(id:String=null, name:String=null)
		{
			super(id, name, ResourceType.ELASTIC_IP);
			elementGroup = ELEMENT_GROUP_RESOURCE;		
		}
		
		override public function get properties():Object
		{
			_properties = new Object();
			
			if(instanceId != null)
			{
				if(_properties["Properties"] == null)
				{
					_properties["Properties"] = new Object();
				}
				_properties["Properties"]["InstanceId"] = instanceId;
			}
			if(domain != null)
			{
				if(_properties["Properties"] == null)
				{
					_properties["Properties"] = new Object();
				}
				_properties["Properties"]["Domain"] = domain;
			}
			_properties["Type"] = elementType;
			return _properties;			
		}
	}
}