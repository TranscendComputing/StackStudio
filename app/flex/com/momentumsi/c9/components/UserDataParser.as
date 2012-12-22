package com.momentumsi.c9.components
{
	import com.maccherone.json.JSON;
	import com.momentumsi.c9.models.Parameter;
	import com.momentumsi.c9.templates.DefaultUserDataObject;
	import com.momentumsi.c9.templates.UserdataObject;
	import com.momentumsi.c9.utils.IntrinsicFunctionUtil;
	
	import flash.events.EventDispatcher;
	import flash.events.IEventDispatcher;
	import flash.utils.ByteArray;
	
	import flashx.textLayout.conversion.TextConverter;
	import flashx.textLayout.elements.FlowElement;
	import flashx.textLayout.elements.TextFlow;
	
	import mx.collections.ArrayCollection;
	import mx.controls.Text;
	
	import spark.components.RichText;
	
	public class UserDataParser extends EventDispatcher
	{
		private static const REF_REGEX:RegExp = new RegExp(/\{(\s)*\"Ref\"(\s)*:(\s)*\"[aA-zZ]*[:]{0,2}[aA-zZ]*\"(\s)*\}/)
		private static const FUNCTION_REGEX:RegExp = new RegExp(/\{(\s)*\"Fn::GetAtt\"(\s)*:(\s)*\[(\s)*\"[aA-zZ]*\"(\s)*,(\s)*\"[aA-zZ]*\"(\s)*\](\s)*\}/)
		public var extractedText:String = new String();
		public var fileSections:ArrayCollection = new ArrayCollection();

		private var defaultData:DefaultUserDataObject = new DefaultUserDataObject();
		public function UserDataParser(target:IEventDispatcher=null)
		{
			super(target);
		}
		
		public function extractCode(userdata:Object=null, templateData:UserdataObject=null):void
		{
			if(userdata == null && templateData == null)
			{
				userdata = defaultData.data;
			}else if(templateData != null){
				userdata = templateData.getData();
			}
			if(userdata[IntrinsicFunctionUtil.BASE_64] != null)
			{
				userdata = userdata[IntrinsicFunctionUtil.BASE_64];
			}
			if(!(userdata is String))
			{
				if(userdata[IntrinsicFunctionUtil.JOIN] != null)
				{
					userdata = userdata[IntrinsicFunctionUtil.JOIN][1];
				}else{
					return;
				}
				var section:BootstrapPanel;
				var panelText:String;
				for(var index:int=0; index < userdata.length; index++)
				{
					if(!(userdata[index] is String))
					{
						extractedText = extractedText + JSON.encode(userdata[index]);
						panelText = panelText + JSON.encode(userdata[index]);
					}else
					{
						if(String(userdata[index]).match(/#/) != null)
						{
							panelText = new String();
							section = new BootstrapPanel();
							section.title = userdata[index];
							fileSections.addItem(section);
						}else{
							panelText = panelText + userdata[index];
						}
						extractedText = extractedText + userdata[index];
					}
					section.commandsPanel.textArea.text = panelText;
				}
			}
		}
		
		public function addInstall(bucket:Object, scriptName:String, install:String, scriptParams:ArrayCollection=null):void
		{
			if(bucket is Parameter)
			{
				bucket = bucket.toRef();
			}
			var installer:Array = new Array();
			installer.push("#--- Install " + install + "\n");
			installer.push("cd /tmp\n");
			if(bucket is String)
			{
				installer.push("s3cmd --config=/etc/s3cfg get s3://" + bucket + "/" + scriptName + "\n");
			}else{
				installer.push("s3cmd --config=/etc/s3cfg get s3://");
				installer.push(bucket);
				installer.push("/" + scriptName + "\n");
			}
			installer.push("chmod +x /tmp/" + scriptName + "\n");
			installer.push("/tmp/" + scriptName + " ");
			if(scriptParams != null)
			{
				for each(var param:Parameter in scriptParams)
				{
					installer.push(param.toRef()," ");
				}
			}
			installer.push("\n");
			extractCode({"Fn::Join": ["", installer]});	
		}
		
		public function formatSections():Object
		{
			var data:String = new String;
			var dataPanel:DraggableTextPanel;
			for each(var panel:BootstrapPanel in fileSections)
			{				
				dataPanel = panel.commandsPanel;
				data = data + dataPanel.title;
				data = data + dataPanel.textArea.text;
			}
			var dataArray:ArrayCollection = new ArrayCollection(data.split(/\n/));
			getParameters(dataArray.source);
			var reference:String;
			var splitRef:Array;
			var index:int;
			for each(var item:String in dataArray)
			{
				index = dataArray.getItemIndex(item);
				if(index != -1)
				{
					for(var i:int=0; i < references.length; i++)
					{
						reference = references[i];
						if(item.indexOf(reference) != -1)
						{
							splitRef = item.split(reference);
							dataArray.setItemAt(splitRef[0], index);
							dataArray.addItemAt(JSON.decode(reference), index + 1);
							dataArray.addItemAt(splitRef[1], index + 2);
							item = splitRef[1];
							index = index + 2;
						}
					}
				}
			}
			
			return {"Fn::Base64": {"Fn::Join": ["", dataArray.source]}};
		}
		
		private var references:Array = [];
		private function getParameters(dataArray:Array):void
		{
			var newReferences:Array;
			var newFunctions:Array;
			var textLine:String;
			for(var index:int=0; index<=dataArray.length - 1; index++)
			{
				textLine = String(dataArray[index]);
				newReferences = textLine.match(REF_REGEX);
				newFunctions = textLine.match(FUNCTION_REGEX);
				var functionStart:int = textLine.search(FUNCTION_REGEX);
				var refStart:int = textLine.search(REF_REGEX);
				if(newFunctions != null && newReferences != null)
				{

					if(functionStart < refStart && functionStart != -1)
					{
						newReferences = newFunctions;
					}
				}
				if(newReferences != null)
				{
					references.push(newReferences[0]);
					newReferences = textLine.split(newReferences[0]);
					getParameters(newReferences);
				}
				dataArray[index] = dataArray[index]  + "\n";
			}
		}
	}
}