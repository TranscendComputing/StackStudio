package com.momentumsi.c9.models
{
	import com.maccherone.json.*;
	import com.momentumsi.c9.constants.ResourceType;
	import com.momentumsi.c9.events.ElementSaveEvent;
	import com.momentumsi.c9.utils.IntrinsicFunctionUtil;
	
	import flash.events.Event;
	import flash.events.EventDispatcher;
	
	import mx.collections.ArrayCollection;
	import mx.events.CollectionEvent;
	import mx.events.CollectionEventKind;
	import mx.rpc.events.ResultEvent;

	[Bindable]
	public class ProjectVersion extends EventDispatcher
	{
		public var id:String;
		public var projectId:String;
		public var version:String;
		public var elements:ArrayCollection = new ArrayCollection();;
		public var nodes:ArrayCollection = new ArrayCollection();;
		public var variants:ArrayCollection = new ArrayCollection();;
		public var embeddedProjects:ArrayCollection;
		public var environments:ArrayCollection = new ArrayCollection();
		
		public static const INITIAL:String = "0.1.0";
		public static const REFRESH:String = "refreshElements";
		public static const SUPPORTED_NODE_ELEMENTS:ArrayCollection = new ArrayCollection([			
			ResourceType.AS_GROUP,
			ResourceType.BEANSTALK_APP,
			ResourceType.CACHE_CLUSTER,
			ResourceType.CACHE_SECURITY_GROUP,
			ResourceType.EMBEDDED_STACK,
			ResourceType.CLOUD_FRONT,
			ResourceType.CW_ALARM,
			ResourceType.DB_INSTANCE,
			ResourceType.DB_SECURITY_GROUP,
			ResourceType.EBS_VOLUME,
			ResourceType.EC2_INSTANCE,
			ResourceType.EC2_SECURITY_GROUP,
			ResourceType.IAM_GROUP,
			ResourceType.IAM_USER,
			ResourceType.LOAD_BALANCER,
			ResourceType.RECORD_SET,
			ResourceType.S3_BUCKET,
			ResourceType.S3_BUCKET_POLICY,
			ResourceType.SNS_POLICY,
			ResourceType.SNS_TOPIC,
			ResourceType.SQS_POLICY,
			ResourceType.SQS_QUEUE,
			ResourceType.WAIT_CONDITION
		]);
				
		public function ProjectVersion()
		{
			//ProjectVersion contructor
		}
		
		public static function buildProjectVersion(pVersion:Object, projectId:String=null):ProjectVersion
		{
			var pv:ProjectVersion = new ProjectVersion();
			
			pv.id = pVersion["id"];
			pv.version = pVersion["version"];
			pv.projectId = projectId;
			
			var responseCollection:ArrayCollection;
			var item:Object;
			
			// Build ArrayCollection of Elements
			responseCollection = new ArrayCollection(pVersion["elements"] as Array);
			for each(item in responseCollection)
			{
				pv.elements.addItem(Element.buildElement(item["element"], projectId));
			}
			
			// Build ArrayCollection of Nodes
			responseCollection = new ArrayCollection(pVersion["nodes"] as Array);
			for each(item in responseCollection)
			{
				pv.nodes.addItem(Node.buildNode(item["node"], projectId));
			}
			
			// Build ArrayCollection of Environments
			responseCollection = new ArrayCollection(pVersion["environments"] as Array);
			for each(item in responseCollection)
			{
				pv.environments.addItem(Environment.buildEnvironment(item["environment"]));
			}
			
			// Build ArrayCollection of Variants
			pv.variants = new ArrayCollection(pVersion["variants"]);
			for each(var variant:Object in pv.variants)
			{
				if(!(variant is ProjectVariant))
				{
					pv.variants.setItemAt(ProjectVariant.buildVariant(variant["variant"]), pv.variants.getItemIndex(variant));
				}
			}
			
			return pv;
		}
		
		public function update(versionObject:Object, projectId:String=null):void
		{
			if(versionObject==null)
			{
				return;
			}
			var index:int;
			
			// Build ArrayCollection of Elements
			var e:Element;
			var versionElements:Array = versionObject["elements"];
			this.elements.removeAll();
			if(versionElements != null)
			{
				for(index=0; index < versionElements.length; index++){
					e = Element.buildElement(versionObject["elements"][index]["element"], projectId);
					this.elements.addItem(e);
				}
			}
			
			// Build ArrayCollection of Nodes
			var n:Node
			var versionNodes:Array = versionObject["nodes"];
			this.nodes.removeAll();
			if(versionNodes != null)
			{
				for(index=0; index < versionNodes.length; index++){
					n = Node.buildNode(versionObject["nodes"][index]["node"], projectId);
					this.nodes.addItem(n);
				}
			}
			
			var updatedVariants:ArrayCollection = new ArrayCollection(versionObject["variants"]);
			for each(var variant:Object in updatedVariants)
			{
				index = updatedVariants.getItemIndex(variant);
				var updatedVariant:Object = variants.setItemAt(ProjectVariant.buildVariant(variant["variant"]), index);
				if(updatedVariant == null)
				{
					this.variants.addItem(ProjectVariant.buildVariant(variant["variant"]));
				}
			}
			
			this.id = versionObject["id"];
			this.version = versionObject["version"];
			dispatchEvent(new Event(REFRESH));
		}
		
		public function validateUniqueName(name:String, reconfigElement:Element=null):Boolean
		{
			if(reconfigElement == null)
			{
				reconfigElement = new Element();
			}
			
			var valid:Boolean = true;
			for each(var element:Element in elements)
			{
				if(reconfigElement != null && reconfigElement.id != element.id)
				{
					if(name == element.name)
					{
						valid = false;
					}
				}
			}
			return valid;
		}
		
		public function getElementByReference(type:String, reference:String, referenceName:String):Element
		{
			try
			{
				for each(var element:Element in elements){
					if(element.elementType == type){
						if(element.properties["Properties"][reference]["Ref"] == referenceName)
						{
							return element;
						}
					}
				}
				
				return null;
			} 
			catch(error:Error){}
			return null;
		}
		
		public function getElementByName(name:String):Element
		{			
			for each(var element:Element in elements){
				if(element.name == name)
				{
					return element;
				}
			}			
			return null;
		}
		
		public function getElementById(id:String):Element
		{
			for each(var element:Element in elements){
				if(element.id == id)
				{
					return element;
				}
			}			
			return null;
		}
		
		public function getNodeById(id:String):Node
		{
			for each(var node:Node in nodes)
			{
				if(node.id == id)
				{
					return node;
				}
			}
			return null;
		}
		
		public function getNodeByName(name:String):Node
		{
			for each(var node:Node in nodes)
			{
				if(node.name == name)
				{
					return node;
				}
			}
			return null;
		}
		
		public function deleteNodeByName(name:String):void
		{
			var node:Node = getNodeByName(name);
			node.deleteFromProject();
		}
		
		public function getElementByType(resourceType:String):ArrayCollection
		{
			var resources:ArrayCollection = new ArrayCollection();
			for each(var element:Element in elements)
			{
				if(element.elementType == resourceType)
				{
					resources.addItem(element);	
				}
			}
			
			return resources;
		}
		
		public function deleteElementByReference(type:String, reference:String, referenceName:String):void
		{
			try
			{
				for each(var element:Element in elements){
					if(element.elementType == type){
						if(element.properties["Properties"][reference]["Ref"] == referenceName)
						{
							element.deleteElement(this);
							var index:int = elements.getItemIndex(element);
							elements.removeItemAt(index);
							return;
						}
					}
				}				
			} 
			catch(error:Error){
				// Element was not found as a reference
			}
		}
		
		public function deleteElementByName(name:String):void
		{
			for each(var element:Element in elements){
				if(element.name == name)
				{
					element.deleteElement(this);
					var index:int = elements.getItemIndex(element);
					elements.removeItemAt(index);
					return;
				}
			}			
		}
		
		public function updateElement(updatedElement:Element):void
		{
			for each(var element:Element in elements){
				if(updatedElement.id == element.id)
				{
					elements.setItemAt(updatedElement, elements.getItemIndex(element));
					return;
				}
			}
			elements.addItem(updatedElement);
		}
		
		public function updateNode(updatedNode:Node):void
		{
			for each(var node:Node in nodes){
				if(updatedNode.id == node.id)
				{
					nodes.setItemAt(updatedNode, nodes.getItemIndex(node));
					return;
				}
			}
			nodes.addItem(updatedNode);
		}
		
		public function deleteAllItems():void
		{
			for each(var node:Node in nodes)
			{
				node.deleteFromProject(this);
			}
			for each(var element:Element in elements)
			{
				element.deleteElement(this);
			}
			nodes.removeAll();
			elements.removeAll();
			dispatchEvent(new Event(REFRESH));
		}
		
		public function saveCollections():void
		{
			for each(var element:Element in elements)
			{
				if(SUPPORTED_NODE_ELEMENTS.contains(element.elementType))
				{
					element.addEventListener(ElementSaveEvent.RESULT, saveElementResultHandler);
				}
				element.save(this);
			}
		}
		
		private function saveElementResultHandler(event:ElementSaveEvent):void
		{
			for each(var node:Node in nodes)
			{
				if(event.element.name == node.name)
				{
					node.elementId = event.element.id;
					node.save(this);
				}
			}
		}
		
		public function buildTemplate():String
		{
			var templateString:String = "";
			var resources:Object = new Object();
			var parameters:Object = new Object();
			var parametersCollection:ArrayCollection = new ArrayCollection();
			var outputsCollection:ArrayCollection = new ArrayCollection();
			var outputs:Object = new Object();
			var mappings:Object = new Object();
			for each(var element:Element in elements)
			{
				if(element.properties is String)
				{
					element.properties = JSON.decode(element.properties.toString());
				}
				if(element.elementGroup == Element.ELEMENT_GROUP_RESOURCE){
					resources[element.name] = element.properties;
				}else if(element.elementGroup == Element.ELEMENT_GROUP_PARAMETER){
					parametersCollection.addItem(element);
					parameters[element.name] = element.properties;
				}else if(element.elementGroup == Element.ELEMENT_GROUP_OUTPUT){
					outputsCollection.addItem(element);
					outputs[element.name] = element.properties;
				}else if(element.elementGroup == Element.ELEMENT_GROUP_MAPPING){
					mappings[element.name] = element.properties;
				}
				
			}
			var template:Object = new Object();
			template["AWSTemplateFormatVersion"] = "2010-09-09";
			template["Description"] = "This template was generated in StackStudio";					
			var isEmpty:Boolean = true;
			var n:*;
			for (n in parameters) { isEmpty = false; break; }
			if(!isEmpty){
				template['Parameters'] = parameters;
				isEmpty = true;
			}
			for (n in mappings) { isEmpty = false; break; }
			if(!isEmpty){
				template['Mappings'] = mappings;
				isEmpty = true;
			}
			for (n in resources) { isEmpty = false; break; }
			if(!isEmpty){
				template['Resources'] = resources;
				isEmpty = true;
			}
			for (n in outputs) { isEmpty = false; break; }
			if(!isEmpty){
				template['Outputs'] = outputs;
				isEmpty = true;
			}
			
			templateString = JSON.encode(template, true);
			return templateString;
		}
		
		public function toTemplate():String
		{
			var templateString:String = new String();
			
			var template:Object = new Object();
			template["AWSTemplateFormatVersion"] = "2010-09-09";
			template["Description"] = "This template was generated in StackStudio";	
			
			templateString = JSON.encode(template, true);

			var resources:String = new String();
			var parameters:String = new String();
			var outputs:String = new String();
			var mappings:String = new String();
			for each(var element:Element in elements)
			{
				if(element.properties is String)
				{
					element.properties = JSON.decode(element.properties.toString());
				}
				if(element.elementGroup == Element.ELEMENT_GROUP_RESOURCE){
					templateString = templateString + "\n" + element.toString();
				}	
			}
			
			return templateString;
		}
		
		public function removeImageMapping(mappingName:String, resourceName:String):void
		{
			//Loop here looks for any other instances or launch configurations using this map
			for each(var resource:Element in elements)
			{
				if(resourceName != resource.name)
				{
					if(resource.elementGroup == Element.ELEMENT_GROUP_RESOURCE)
					{
						if(resource.properties.hasOwnProperty('Properties'))// && resource.properties['Properties'].hasOwnProperty('ImageId') && resource.properties['Properties']['ImageId'] is Object && resource.properties['Properties']['ImageId'].hasOwnProperty('Fn::FindInMap'))
						{
							var comparisonMappings:ArrayCollection = IntrinsicFunctionUtil.findReferencedMappings(resource.properties.Properties);
							for each(var comparisonMappingName:String in comparisonMappings)
							{
								if(comparisonMappingName == mappingName)
								{
									//Mapping is being used in another resource, return without deleting
									return;
								}
							}
						}
					}
				}
			}
			
			//If mapping not found in another resource (thus returned) delete
			deleteElementByName(mappingName);
		}
		
		public function getParameters():ArrayCollection
		{
			var parameterCollection:ArrayCollection = new ArrayCollection();
			
			for each(var element:Element in elements)
			{
				if(element.properties is String)
				{
					element.properties = JSON.decode(element.properties.toString());
				}
				if(element.elementGroup == Element.ELEMENT_GROUP_PARAMETER)
				{
					parameterCollection.addItem(element);
				}
			}
			
			return parameterCollection;
		}
		
		public function getMappings():ArrayCollection
		{
			var mappingCollection:ArrayCollection = new ArrayCollection();
			
			for each(var element:Element in elements)
			{
				if(element.properties is String)
				{
					element.properties = JSON.decode(element.properties.toString());
				}
				if(element.elementGroup == Element.ELEMENT_GROUP_MAPPING)
				{
					mappingCollection.addItem(element);
				}
			}
			
			return mappingCollection;
		}
		
		public function getResourcesByType(type:String):ArrayCollection
		{
			var resourcesCollection:ArrayCollection = new ArrayCollection();
			for each(var element:Element in elements)
			{
				if(element.elementType == type)
				{
					resourcesCollection.addItem({Ref: element.name});
				}
			}
			return resourcesCollection;
		}
		
		//Used to determine is a parameter or resource is referenced anywhere within another template element
		public function checkForReferences(reference:String):ArrayCollection
		{
			var referencesFound:ArrayCollection = new ArrayCollection();
			for each(var element:Element in elements)
			{
				if(element.elementGroup == Element.ELEMENT_GROUP_RESOURCE || element.elementGroup == Element.ELEMENT_GROUP_OUTPUT)
				{
					referencesFound.addAll(IntrinsicFunctionUtil.findReferences(element.name, element.properties, reference));
				}
			}
			return referencesFound;
		}
	}
}
