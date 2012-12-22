package com.momentumsi.c9.models
{
	import com.maccherone.json.JSON;
	import com.momentumsi.c9.events.NodeEvent;
	import com.momentumsi.c9.services.ProjectService;
	
	import flash.events.EventDispatcher;
	
	import fr.kapit.diagrammer.base.uicomponent.DiagramSprite;
	
	import mx.rpc.AsyncToken;
	import mx.rpc.events.ResultEvent;

	[Event(name="nodeEvent", type="com.momentumsi.c9.events.NodeEvent")]
	[Event(name="updateNode", type="com.momentumsi.c9.events.NodeEvent")]
	[Bindable]
	public class Node extends EventDispatcher
	{
		public static const DESIGN_VIEW:String = "design";
		public static const RUNNING_VIEW:String = "runtime";
		public static const DEPLOY_VIEW:String = "deploy";
		
		public var id:String;
		public var name:String;
		public var x:int;
		public var y:int;
		public var view:String;
		public var elementId:String;
		public var properties:Object;
		public var nodeLinks:Array = [];
		
		public var projectId:String;
		private var projectSvc:ProjectService;
		public var projectVersion:ProjectVersion;
		
		private var diagramNode:DiagramSprite;
		
		public function Node(id:String=null, name:String=null, x:int=0, y:int=0, view:String=null, properties:Object=null, elementId:String=null, nodeLinks:Array=null, projectId:String=null)
		{
			this.id = id;
			this.name = name;
			this.x = x;
			this.y = y;
			this.view = view;
			if(properties is String)
			{
				this.properties = JSON.decode(properties.toString());
			}else{
				this.properties = properties;
			}
			this.elementId = elementId;
			this.nodeLinks = nodeLinks;
			this.projectId = projectId;
		}

		
		public static function buildNode(node:Object, projectId:String=null):Node
		{
			var n:Node;
			
			n = new Node(node["id"], node["name"], node["x"], node["y"], node["view"], node["properties"], node["element_id"], node["node_links"], projectId);
			
			return n;
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
			return {node:{
				name: name,
				x: x,
				y: y,
				view: view,
				element_id: elementId,
				properties: requestProperties,
				node_links: nodeLinks}
			}
					
		}
		
		public function copy():Node
		{
			var copiedNode:Node = new Node();
			copiedNode.id = null;
			copiedNode.name = name.replace(/\s/g, "");
			copiedNode.x = x;
			copiedNode.y = y;
			copiedNode.view = view;
			copiedNode.properties = properties;
			copiedNode.elementId = elementId;
			copiedNode.nodeLinks = nodeLinks;
			copiedNode.projectId = projectId;
			return copiedNode;
		}
		
		public function save(version:ProjectVersion, diagramNode:DiagramSprite=null):AsyncToken
		{
			projectVersion = version;
			if(version.projectId != null)
			{
				projectId = version.projectId;
			}
			this.diagramNode = diagramNode; 
			if(id == null)
			{
				return create();
			}else{
				return update();
			}
		}
		
		private function create():AsyncToken
		{
			if(diagramNode != null)
			{
				this.diagramNode = diagramNode;
				this.x = diagramNode.x;
				this.y = diagramNode.y;
			}
			projectSvc = new ProjectService();
			projectSvc.projectId = projectId;
			projectSvc.addEventListener(ResultEvent.RESULT, createNode_resultHandler);
			return projectSvc.createNode(this, projectVersion.version);
		}
		
		private function update():AsyncToken
		{
			if(diagramNode != null)
			{
				diagramNode.data = this;
			}
			projectSvc = new ProjectService();
			projectSvc.projectId = projectId;
			projectSvc.addEventListener(ResultEvent.RESULT, updateNode_resultHandler);
			return projectSvc.updateNode(this, projectVersion.version);
			projectVersion.updateNode(this);
		}
		
		private function createNode_resultHandler(event:ResultEvent):void
		{
			id = projectSvc.result["node"]["id"];
			if(diagramNode != null)
			{
				diagramNode.data = this;
			}
			projectVersion.updateNode(this);
			dispatchEvent(new NodeEvent(NodeEvent.UPDATE));
		}
		
		private function updateNode_resultHandler(event:ResultEvent):void
		{
			dispatchEvent(new NodeEvent(NodeEvent.UPDATE));
		}
		
		public function createNodeLink(nodeToLink:Node, source:Boolean=true, version:String=ProjectVersion.INITIAL):void
		{
			if(projectVersion != null)
			{
				version = projectVersion.version;
			}
			
			var node_link:Object = new Object();
			if(source)
			{
				node_link["source_id"] = id;
				node_link["target_id"] = nodeToLink.id;
			}else{
				node_link["target_id"] = id;
				node_link["source_id"] = nodeToLink.id;
			}
			projectSvc = new ProjectService();
			projectSvc.projectId = projectId;
			projectSvc.createLink(node_link, version);
		}
		
		public function removeNodeLink(nodeId:String, source:Boolean=true):void
		{
			var newLinks:Array = new Array();
			var nodeLink:Object;
			var linkId:String;
			if(source)
			{
				linkId = "target_id";
			}else{
				linkId = "source_id";
			}
			for(var index:int=0; index < nodeLinks.length; index++)
			{
				nodeLink = nodeLinks[index]["node_link"];
				if(nodeLink[linkId] != nodeId)
				{
					newLinks.push(nodeLinks[index]);
				}
			}
			nodeLinks = newLinks;
			projectSvc = new ProjectService();
			projectSvc.projectId = projectId;
			projectSvc.updateNode(this, projectVersion.version);
		}
		
		public function deleteFromProject(projectVersion:ProjectVersion=null):void
		{
			projectSvc = new ProjectService();
			projectSvc.projectId = projectId;
			projectSvc.deleteNode(id, projectVersion.version);
		}
	}
}