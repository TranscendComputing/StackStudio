package com.momentumsi.c9.components.cfn
{
	import com.maccherone.json.JSON;
	import com.momentumsi.c9.components.MainBox;
	import com.momentumsi.c9.utils.Helpers;
	
	import flash.geom.Point;
	
	import fr.kapit.diagrammer.Diagrammer;
	import fr.kapit.diagrammer.base.uicomponent.DiagramSprite;
	
	import mx.collections.ArrayCollection;
	import mx.rpc.AsyncToken;
	import mx.rpc.events.ResultEvent;
	import mx.rpc.http.mxml.HTTPService;

	public class CloudFormationTemplate extends Object
	{
		public var resources:Object;
		public var references:ArrayCollection = new ArrayCollection();
		public var linkCollection:ArrayCollection = new ArrayCollection();
		private var parentResource:String;
		public var loadTemplateSvc:HTTPService = new HTTPService();
		
		public var mainBox:MainBox;
		public var designDiagram:Diagrammer;
		
		public function CloudFormationTemplate()
		{
			super();
		}
		
		public function removeResource(name:String):void
		{
			delete resources[name];
		}
		
		public function getResourceReferences():void
		{
			for(var resource:* in resources)
			{
				parentResource = resource;
				getReference(resources[resource]);				
			}
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
									if(!linkCollection.contains({parent: parentResource, reference: resource[props][i]['Ref']})){
										if(!references.contains(resource[props][i]['Ref']))
										{
											references.addItem(resource[props][i]['Ref']);
										}
										linkCollection.addItem({parent: parentResource, reference: resource[props][i]['Ref'] });
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
							if(!references.contains(resource[props]))
							{
								references.addItem(resource[props]);
								linkCollection.addItem({parent: parentResource, reference: resource[props]});
							}
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
	}
}