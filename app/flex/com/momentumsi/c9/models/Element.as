package com.momentumsi.c9.models
{	
	import com.maccherone.json.JSON;
	import com.momentumsi.c9.events.ElementSaveEvent;
	import com.momentumsi.c9.services.ProjectService;
	import com.momentumsi.c9.utils.IntrinsicFunctionUtil;
	
	import flash.events.EventDispatcher;
	
	import mx.collections.ArrayCollection;
	import mx.rpc.AsyncToken;
	import mx.rpc.events.ResultEvent;

	public class Element extends EventDispatcher
	{
		public static const ELEMENT_GROUP_RESOURCE:String = "Resources";
		public static const ELEMENT_GROUP_PARAMETER:String = "Parameters";
		public static const ELEMENT_GROUP_OUTPUT:String = "Outputs";
		public static const ELEMENT_GROUP_MAPPING:String = "Mappings";
		
		
		public var id:String;
		[Bindable]
		public var name:String;
		public var elementType:String;
		
		public var projectId:String;
		private var projectSvc:ProjectService;
		public var projectVersion:ProjectVersion;
		private var _properties:Object = new Object();

		
		public function Element(id:String=null, name:String=null, elementType:String=null, projectId:String=null)
		{
			this.id = id;
			this.name = name;
			this.elementType = elementType;
			this.projectId = projectId;
		}
		
		public static function buildElement(element:Object, projectId:String=null):Element
		{
			var e:Element;
			e = new Element(element["id"], element["name"], element["element_type"], projectId);
			e.properties = JSON.decode(element["properties"]);
			if(e.properties is String)
			{
				e.properties = JSON.decode(e.properties.toString());
			}
			e.elementGroup = element["group_name"];
			return e;
		}
				
		[Bindable]
		public function get properties():Object
		{
			return _properties;
		}
		
		public function set properties(value:Object):void
		{
			_properties = value;
		}
		
		//Setting the element group
		[Inspectable(enumeration="Resources,Parameters,Outputs,Mappings", defaultValue="Resources", category="General")]		
		/**
		 *  Value that indicates the element type
		 */
		private var _elementGroup:String = ELEMENT_GROUP_RESOURCE;

		public function get elementGroup():String
		{
			return _elementGroup;
		}
		
		/**
		 *  @private
		 */
		public function set elementGroup(value:String):void
		{
			switch (value)
			{
				case ELEMENT_GROUP_RESOURCE:
				case ELEMENT_GROUP_PARAMETER:
				case ELEMENT_GROUP_OUTPUT:
				case ELEMENT_GROUP_MAPPING:
				{
					break;
				}
			}
			_elementGroup = value;
		}
		
		public function toObject():Object
		{
			var requestProperties:String;
			if(properties is String)
			{
				requestProperties = String(properties);
			}else{
				requestProperties = JSON.encode(properties);
			}
			return {element: {
				name: name,
				group_name: _elementGroup,
				element_type: elementType,
				properties: requestProperties}
			}
		}
		
		public function toRef():Object
		{
			return {Ref: name};
		}
		
		public function deleteElement(projectVersion:ProjectVersion):void
		{
			projectSvc = new ProjectService();
			projectSvc.projectId = projectId;
			projectSvc.deleteElement(id, projectVersion.version);
		}
		
		public function save(version:ProjectVersion):AsyncToken
		{
			projectVersion = version;
			var currentElement:Element = projectVersion.getElementByName(name);
			if(currentElement != null)
			{
				id = currentElement.id;
			}
			if(version.projectId != null)
			{
				projectId = version.projectId;
			}
			if(id == null)
			{
				return create();
			}else{
				return update();
			}
		}
		
		private function update():AsyncToken
		{
			projectSvc = new ProjectService();
			projectSvc.projectId = projectId;
			projectSvc.addEventListener(ResultEvent.RESULT, createUpdateElement_resultHandler);
			return projectSvc.updateElement(this, projectVersion.version);
		}
		
		private function create():AsyncToken
		{
			projectSvc = new ProjectService();
			projectSvc.projectId = projectId;
			projectSvc.addEventListener(ResultEvent.RESULT, createUpdateElement_resultHandler);
			return projectSvc.createElement(this, projectVersion.version);
		}
		
		private function createUpdateElement_resultHandler(event:ResultEvent):void
		{
			if(id == null)
			{
				id = projectSvc.result["element"]["id"];
			}
			dispatchEvent(new ElementSaveEvent(projectSvc.result));
			projectVersion.updateElement(this);
		}
		
		override public function toString():String
		{
			var templateObject:Object = new Object();
			templateObject["Type"] = elementType;
			templateObject["Properties"] = properties;
			return "\"" + name + "\":\n" 
				+ JSON.encode(templateObject, true);
		}
		
		
		public function removeMappings(version:ProjectVersion):void
		{
			var mappings:ArrayCollection = IntrinsicFunctionUtil.findReferencedMappings(properties.Properties);
			for each(var mappingName:String in mappings)
			{
				version.removeImageMapping(mappingName, name);
			}				
		}
	}
}