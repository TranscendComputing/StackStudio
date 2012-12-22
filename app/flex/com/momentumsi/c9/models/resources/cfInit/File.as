package com.momentumsi.c9.models.resources.cfInit
{
	import com.maccherone.json.JSON;
	import com.momentumsi.c9.utils.IntrinsicFunctionUtil;

	[Bindable]
	public class File
	{
		public var name:String
		public var content:Object;
		public var source:String;
		public var encoding:String;
		public var group:String;
		public var owner:String;
		public var mode:int;
		public var authentication:String;
		
		public function File()
		{
		}
		
		public static function buildFile(name:String, initObj:Object):File
		{
			var newFile:File = new File();
			newFile.name = name;
			for(var prop:* in initObj)
			{
				newFile[prop] = initObj[prop];
			}
			return newFile;
		}
		
		public function toJson():Object
		{
			var file:Object = new Object();
			if(content != null)
			{
				file.content = content;
			}
			if(mode != -1)
			{
				file.mode = mode.toString();
			}
			if(owner != null)
			{
				file.owner = owner;
			}
			if(group != null)
			{
				file.group = group;
			}
			if(source != null)
			{
				file.source = source;
			}
			return file; 
		}
		
		public function get contentString():String 
		{
			if(content != null)
			{
				return JSON.encode(content, true);
			}else{
				return new String();
			}
		}
	}
}