package com.momentumsi.c9.serializers
{
	import com.adobe.serialization.json.JSON;
	
	import mx.rpc.http.AbstractOperation;
	import mx.rpc.http.SerializationFilter;
	
	public class JSONSerializationFilter extends SerializationFilter
	{
		public function JSONSerializationFilter()
		{
			super();
		}
		
		override public function serializeBody(operation:AbstractOperation, obj:Object):Object
		{
			return JSON.encode(obj);
		}
	}
}