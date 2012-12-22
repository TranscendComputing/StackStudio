package com.momentumsi.c9.models.resources
{
	import com.momentumsi.c9.constants.ResourceType;
	import com.momentumsi.c9.models.Element;
	
	public class ElasticIpAssociation extends Element
	{
		[Bindable]
		public var instanceId:Object;
		[Bindable]
		public var eip:Object;
		[Bindable]
		public var allocationId:Object;
		private var _properties:Object;
			
		public function ElasticIpAssociation(id:String=null, name:String=null)
		{
			super(id, name, ResourceType.ELASTIC_IP_ASSOC);
			elementGroup = ELEMENT_GROUP_RESOURCE;
		}
		
		override public function get properties():Object
		{
			_properties = new Object();
			
			if(eip != null)
			{
				_properties["EIP"] = eip;
			}
			if(allocationId != null)
			{
				_properties["AllocationId"] = allocationId;
			}
			
			_properties["InstanceId"] = instanceId;
			
			var props:Object = _properties;
			_properties = new Object();
			_properties["Properties"] = props;
			
			_properties["Type"] = elementType;
			return _properties;
		}
	}
}