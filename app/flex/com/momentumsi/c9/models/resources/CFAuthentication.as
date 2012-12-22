package com.momentumsi.c9.models.resources
{
	import mx.collections.ArrayCollection;

	[Bindable]
	public class CFAuthentication
	{
		public var authenticationName:String = "S3AccessCreds";
		public var accessKeyId:Object;
		public var secretKey:Object;
		public var buckets:Array;
		public var authenticationType:String;
		
		public static const AUTHENTICATION_TYPES:ArrayCollection = new ArrayCollection([S3_TYPE, BASIC_TYPE]); 
		public static const S3_TYPE:String = "S3";
		public static const BASIC_TYPE:String = "basic";
		
		public function CFAuthentication()
		{
		}
		
		public function setDefaultAuthentication(key:IamAccessKey, bucketName:String):void
		{
			authenticationType = S3_TYPE;
			accessKeyId = key.toRef();
			secretKey = key.getSecretAccessKey();
			buckets = [bucketName];
		}
		
		public function toJson():Object
		{
			var authObj:Object = new Object();
			authObj[authenticationName] = {
				type: authenticationType,
				accessKeyId: accessKeyId,
				secretKey: secretKey
			};
			if(buckets != null)
			{
				authObj[authenticationName]["buckets"] = buckets;
			}
			return authObj;
		}
	}
}