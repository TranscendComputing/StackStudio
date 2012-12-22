package com.momentumsi.c9.models
{
	[Bindable]
	public class Template
	{
		public var id:String;
		public var name:String;
		public var template_type:String;
		public var import_source:String;
		public var raw_json:String;
		
		public function Template()
		{
			//Template constructor
		}
		
		public static function buildTemplate(template:Object):Template
		{
			var newTemplate:Template = new Template();			
			newTemplate.id = template["id"];
			newTemplate.name = template["name"];
			newTemplate.template_type = template["template_type"];
			newTemplate.import_source = template["import_source"];
			return newTemplate; 
		}
		
		public function toObject():Object
		{
			return {
				template:
				{
					name: name, 
					template_type: template_type, 
					import_source: import_source,
					raw_json: raw_json
				}
			};
		}
	}
}