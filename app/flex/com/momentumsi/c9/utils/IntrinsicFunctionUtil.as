package com.momentumsi.c9.utils
{
	import com.momentumsi.c9.models.CloudMapping;
	
	import mx.collections.ArrayCollection;

	public class IntrinsicFunctionUtil
	{
		public static const FIND_IN_MAP:String = "Fn::FindInMap";
		public static const GET_ATT:String = "Fn::GetAtt";
		public static const REF:String = "Ref";
		public static const JOIN:String = "Fn::Join";
		public static const SELECT:String = "Fn::Select";
		public static const BASE_64:String = "Fn::Base64";
		public static const GET_AZS:String = "Fn::GetAZs";
		public static const REF_REGION:Object = {Ref: "AWS::Region"};
		
		public static function toDisplay(item:Object):String
		{
			if(item == null)
			{
				return null;
			}
			if(item is String)
			{
				return String(item);
			}
			if(item.Ref){
				return "@" + item.Ref;
			}
			if(item[FIND_IN_MAP]){
				return "#" + item[FIND_IN_MAP][0];
			}
			if(item[GET_ATT]){
				return item[GET_ATT][0] + "=>"  + item[GET_ATT][1];
			}
			
			return "unavailable";
		}
		
		public static function getMapName(item:Object):String
		{
			if(item != null && item is CloudMapping)
			{
				return item[FIND_IN_MAP][0];
			}else
			{
				return "";
			}
		}
		
		public static function findReferencedMappings(item:Object):ArrayCollection
		{
			var mappings:ArrayCollection = new ArrayCollection();
			for(var p:* in item)
			{
				if(!(item[p] is String))
				{
					if(item[p][FIND_IN_MAP])
					{
						mappings.addItem(item[p][FIND_IN_MAP][0]);
					}
					mappings.addAll(findReferencedMappings(item[p]));
				}
			}
			return mappings;
		}
		
		public static function findReferences(itemName:String, itemProperties:Object, reference:String):ArrayCollection
		{
			var references:ArrayCollection = new ArrayCollection();
			for(var p:* in itemProperties)
			{
				if(!(itemProperties[p] is String))
				{
					if(itemProperties[p].hasOwnProperty([REF]))
					{
						if(itemProperties[p][REF] == reference)
						{
							references.addItem({name: itemName, property: p})
						}
					}else{
						references.addAll(findReferences(itemName, itemProperties[p], reference));
					}
				}
			}
			return references;
		}
	}
}