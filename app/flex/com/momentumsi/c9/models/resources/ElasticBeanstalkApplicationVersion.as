package com.momentumsi.c9.models.resources
{
	[Bindable]
	public class ElasticBeanstalkApplicationVersion
	{
		private var _versionLabel:String = "Version 1.0";
		private var _sourceBundle:Object = new Object();
		public var description:String = "Initial Version";
		
		public function ElasticBeanstalkApplicationVersion(data:Object=null)
		{
			if(data != null)
			{
				_versionLabel = data.VersionLabel;
				_sourceBundle = data.SourceBundle;
				description = data.Description;
			}
		}
		
		public function get s3Bucket():Object 
		{
			return _sourceBundle.S3Bucket;
		}
		
		public function set s3Bucket(value:Object):void 
		{
			_sourceBundle.S3Bucket = value;
		}
		
		public function get s3Key():String 
		{
			return _sourceBundle.S3Key;
		}
		
		public function set s3Key(value:String):void 
		{
			_sourceBundle.S3Key = value;
		}
		
		public function get versionLabel():String 
		{
			return _versionLabel;
		}
		
		public function set versionLabel(value:String):void 
		{
			_versionLabel = value;
		}
		
		public function toObject():Object
		{
			var returnObj:Object = new Object();
			returnObj.VersionLabel = _versionLabel;
			if(_sourceBundle.S3Bucket)
			{
				returnObj.SourceBundle = {S3Bucket: _sourceBundle.S3Bucket, S3Key: _sourceBundle.S3Key}
			}
			if(description)
			{
				returnObj.Description = description;
			}
			return returnObj;
		}
	}
}