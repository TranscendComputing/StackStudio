package com.momentumsi.c9.models
{
	import flash.display.Bitmap;
	import flash.events.EventDispatcher;
	import flash.utils.ByteArray;
	
	import mx.collections.ArrayCollection;

	[Bindable]
	public class Stack extends EventDispatcher
	{
		public var name:String;
		public var description:String;
		public var support_details:String;
		public var license_agreement:String;
		public var image_name:String;
		public var image_data:*;
		public var is_public:Boolean;
		public var created_at:String;
		public var updated_at:String;
		public var account:User = new User();
		public var category_id:String;
		public var category:Object;
		public var template_id:String;
		public var templates:ArrayCollection = new ArrayCollection();
		public var id:String;
		public var downloads:int;	
		
		public function Stack()
		{
			// Stack Contructor
		}
		
		public function toObject():Object
		{
			return {
				stack:
				{
					id: id, 
					name: name,
					description: description,
					support_details: support_details,
					license_agreement: license_agreement,
					image_name: image_name,
					image_data: image_data,
					is_public: is_public,
					account_id: account.id,
					category_id: category_id,
					template_id: template_id
				}
			};
		}
		
		public static function buildStack(stack:Object):Stack
		{
			var newStack:Stack = new Stack();
			
			var stackTemplates:ArrayCollection = new ArrayCollection(stack["templates"] as Array);
			var template:Template;
			for each (var temp:Object in stackTemplates)
			{
				template = Template.buildTemplate(temp["template"]);
				newStack.templates.addItem(template);
			}
			newStack.id = stack["id"];
			newStack.name = stack["name"];
			newStack.description = stack["description"];
			newStack.support_details = stack["support_details"];
			newStack.license_agreement = stack["license_agreement"];
			newStack.image_name = stack["license_agreement"];
			newStack.image_data = stack["image_data"];
			newStack.is_public = stack["public"];
			newStack.created_at = stack["created_at"];
			newStack.updated_at = stack["updated_at"];
			
			if(stack["account"] != null)
			{
				newStack.account = User.buildUser(stack["account"]);
			}
			newStack.category = stack["category"];
			if(newStack.category != null)
			{
				newStack.category_id = stack["category"]["id"];
			}
			
			return newStack;
		}
	}
}