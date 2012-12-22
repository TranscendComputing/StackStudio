package com.momentumsi.c9.models.resources
{
	import com.momentumsi.c9.constants.ResourceType;
	import com.momentumsi.c9.models.Element;

	[Bindable]
	public class IamAccessKey extends Element
	{
		private var _username:Object;
		private static const DEFAULT_NAME:String = "HostKeys";
		private static const SECRET_ACCESS_KEY:String = "SecretAccessKey";
		public function IamAccessKey(username:Object)
		{
			elementGroup = ELEMENT_GROUP_RESOURCE;
			elementType = ResourceType.IAM_ACCESS_KEY;
			name = DEFAULT_NAME;
			_username = username;
		}
		
		public function getSecretAccessKey():Object
		{
			return {"Fn::GetAtt": [name, SECRET_ACCESS_KEY]};
		}
		
		private var _properties:Object;
		override public function get properties():Object
		{	
			_properties = new Object();
			
			if(_username != null){
				_properties["UserName"] = _username;
			}
			
			var props:Object = _properties;
			_properties = new Object();
			_properties["Properties"] = props;

			_properties["Type"] = elementType;
			return _properties;
		}
		
		override public function set properties(value:Object):void
		{
			_properties = value;
			
			value = value["Properties"];
			if(value != null)
			{
				_username = value["UserName"];
			}
		}
	}
}