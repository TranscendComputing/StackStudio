package com.momentumsi.c9.services
{
	import com.adobe.serialization.json.JSON;
	import com.maccherone.json.JSON;
	import com.momentumsi.c9.constants.ResourceType;
	import com.momentumsi.c9.events.LoadTemplateEvent;
	import com.momentumsi.c9.models.Element;
	import com.momentumsi.c9.models.Stack;
	import com.momentumsi.c9.models.Template;
	import com.momentumsi.c9.serializers.JSONSerializationFilter;
	
	import flash.events.Event;
	import flash.net.URLRequestMethod;
	
	import mx.collections.ArrayCollection;
	import mx.core.FlexGlobals;
	import mx.rpc.AsyncToken;
	import mx.rpc.events.ResultEvent;
	
	/**
	 *  Dispatched when an TemplatesService.getRawTemplate call returns successfully and sets elements collection.
	 * @eventType com.momentumsi.c9.events.LoadTemplateEvent 
	 *
	 *  @langversion 3.0
	 *  @playerversion Flash 9
	 *  @playerversion AIR 1.1
	 *  @productversion Flex 3
	 */
	[Event(name="templateLoaded", type="com.momentumsi.c9.events.LoadTemplateEvent")]
	[Event(name="stacksLoaded", type="flash.events.Event")]
	[Bindable]
	public class TemplatesService extends ApiService
	{
		public static const STACKS_LOADED:String = "stacksLoaded";
		
		public var stacks:ArrayCollection = new ArrayCollection();
		public var rawTemplate:String;
		public var elementsCollections:ArrayCollection;
		public var template:Object;
		public var resources:Object;
		public var mappings:Object;
		public var parameters:Object;
		public var outputs:Object;
		
		private var templateUrl:String;
		
		public function TemplatesService(rootURL:String=null, destination:String=null)
		{
			super(rootURL, destination);
			url = FlexGlobals.topLevelApplication.GetConfiguration("apiHost");
			templateUrl = url + "/stackplace/v1/templates";
		}

		// API actions
		public function createNewTemplate(template:Template):void
		{
			setPost();
			url = templateUrl;
			request = template.toObject();
			send();
		}
		
		public function getTemplates():void
		{
			url += "/stackplace/v1/stacks?page=1&per_page=100";
			this.addEventListener(ResultEvent.RESULT, stackQueryResult);
			send();
		}
		
		public function getRawJsonTemplate(templateId:String):AsyncToken
		{
			url += "/stackplace/v1/templates/" + templateId + "/raw";
			addEventListener(ResultEvent.RESULT, getRawTemplateResult);
			return send();
		}
		
		public function getTemplateFromUrl(url:String):void
		{
			super.url = url;
			method = "GET";
			addEventListener(ResultEvent.RESULT, getRawTemplateResult);
			send();
		}
		
		// API action result handlers
		private function stackQueryResult(event:ResultEvent):void
		{
			for(var index:int=0; index < this.result["stacks"].length; index++){
				stacks.addItem(Stack.buildStack(this.result["stacks"][index]["stack"]));
			}
			dispatchEvent(new Event(STACKS_LOADED));
		}
		
		private function getRawTemplateResult(event:ResultEvent):void
		{
			rawTemplate = String(event.result);
			buildTemplateFromSource(rawTemplate);
		}
		
		public function buildTemplateFromSource(templateSource:String):void
		{
			try
			{
				template = com.adobe.serialization.json.JSON.decode(templateSource);
			}catch(e:Error)
			{
				template = com.maccherone.json.JSON.decode(templateSource);
			}
			
			elementsCollections = new ArrayCollection();
			var templateVersion:String = template["AWSTemplateFormatVersion"];
			var templateDescription:String = template["Description"];
			var templateResources:Object = template["Resources"];
			resources = template["Resources"];
			var templateOutputs:Object = template["Outputs"];
			var templateParameters:Object = template["Parameters"];
			var templateMappings:Object = template["Mappings"];
			
			var element:Element;

			var item:*;
			for(item in templateResources)
			{
				element = new Element(null, item, templateResources[item]["Type"]);
				element.elementGroup = Element.ELEMENT_GROUP_RESOURCE;
				element.properties = com.maccherone.json.JSON.encode(templateResources[item]);
				elementsCollections.addItem(element);
			}
			for(item in templateParameters)
			{
				element = new Element(null, item, "Parameter");
				element.elementGroup = Element.ELEMENT_GROUP_PARAMETER;
				element.properties = com.maccherone.json.JSON.encode(templateParameters[item]);
				elementsCollections.addItem(element);
			}
			for(item in templateOutputs)
			{
				element = new Element(null, item, "Output");
				element.elementGroup = Element.ELEMENT_GROUP_OUTPUT;
				element.properties = com.maccherone.json.JSON.encode(templateOutputs[item]);
				elementsCollections.addItem(element);
			}
			for(item in templateMappings)
			{
				element = new Element(null, item, "Mapping");
				element.elementGroup = Element.ELEMENT_GROUP_MAPPING;
				element.properties = com.maccherone.json.JSON.encode(templateMappings[item]);
				elementsCollections.addItem(element);
			}
			
			getResourceReferences();
			
			dispatchEvent(new LoadTemplateEvent(elementsCollections, rawTemplate, _linkCollection));
		}
		
		private var _linkCollection:ArrayCollection;
		private var _references:ArrayCollection;
		private var _parentResource:Object;
		public function getResourceReferences():void
		{
			_linkCollection = new ArrayCollection();
			_references = new ArrayCollection();
			for(var resource:* in resources)
			{
				_parentResource = resource;
				getReference(resources[resource]);				
			}
			
			linkSecondaryObjects(ResourceType.AS_GROUP, ResourceType.AS_LAUNCH_CONFIG);
			linkSecondaryObjects(ResourceType.DB_INSTANCE, ResourceType.DB_SECURITY_GROUP);
		}
		
		private function getReference(resource:Object):void
		{	
			for(var props:* in resource)
			{
				if(resource[props] is Array)
				{
					for(var i:int = 0; i < resource[props].length; i++)
					{
						try
						{
							if(resource[props][i]['Ref'] != null){
								if(resources[resource[props][i]['Ref']] != null)
								{
									if(!_linkCollection.contains({parent: _parentResource, reference: resource[props][i]['Ref']})){
										//if(!_references.contains(resource[props][i]['Ref']))
										//{
										//	_references.addItem(resource[props][i]['Ref']);
										//}
										_linkCollection.addItem({
											parent: _parentResource, 
											parentType: resources[_parentResource]["Type"], 
											reference: resource[props][i]['Ref'], 
											referenceType: resources[resource[props][i]['Ref']]["Type"]
										});
									}
								}								
							}
						} 
						catch(error:Error) 
						{
							//array item is not a reference, catch here and move on
						}
					}
				}
				if(props == "Ref")
				{
					try
					{
						if(resources[resource[props]] != null)
						{
							//if(!_references.contains(resource[props]))
							//{
							//	_references.addItem(resource[props]);
								trace(resources[_parentResource]["Type"]);
								trace(resource[props]);
								trace(resources[resource[props]]["Type"]);
								_linkCollection.addItem({
									parent: _parentResource,
									parentType: resources[_parentResource]["Type"],
									reference: resource[props],
									referenceType: resources[resource[props]]["Type"]
								});
							//}
						}
					} 
					catch(error:Error) 
					{
						//resource[props] does not reference template resource (probably parameter or mapping, etc., so catch error and move on
					}
				}
				getReference(resource[props]);
			}
		}
		
		private function linkSecondaryObjects(parentType:String, referenceType:String):void
		{
			var link:Object;
			for each(link in _linkCollection)
			{
				if(link.parentType == parentType && link.referenceType == referenceType)
				{
					if(link.referenceType != ResourceType.WAIT_CONDITION)
					{
						for each(var secondaryLink:Object in _linkCollection)
						{
							if(secondaryLink.parent == link.reference)
							{
								_linkCollection.addItem({
									parent: link.parent, 
									parentType: link.parentType, 
									reference: secondaryLink.reference, 
									referenceType: secondaryLink.referenceType
								});
							}
						}
					}
				}
			}
		}
	}
}