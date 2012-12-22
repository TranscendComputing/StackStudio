package com.momentumsi.c9.models.resources
{
	import com.momentumsi.c9.constants.ResourceType;
	import com.momentumsi.c9.models.Element;
	
	import mx.collections.ArrayCollection;
	
	[Bindable]
	public class S3BucketPolicy extends Element
	{
		public var bucket:Object;
		
		/**
		 * PolicyDocument properties
		 * */		
		public var version:String = "2008-10-17";
		public var policyId:String;
		
		/**
		 * PolicyDocument-Statement properties
		 * */
		public var sid:String;
		public var action:Array;
		public var effect:String;
		public var resource:Object;
		public var principal:Object;
		
		/***
		 * Constants
		 * */
		public static const ACTIONS:ArrayCollection = ([
			{label: "s3:AbortMultipartUpload"},
			{label: "s3:CopyObject"},
			{label: "s3:CreateBucket"},
			{label: "s3:DeleteBucket"},
			{label: "s3:DeleteObject"},
			{label: "s3:DeleteObjectVersion"},
			{label: "s3:GetBucketAccessControlPolicy"},
			{label: "s3:GetBucketAcl"},
			{label: "s3:GetBucketLocation"},
			{label: "s3:GetBucketLogging"},
			{label: "s3:GetBucketNotification"},
			{label: "s3:GetBucketPolicy"},
			{label: "s3:GetBucketRequestPayment"},
			{label: "s3:GetBucketVersioning"},
			{label: "s3:GetLifecycleConfiguration"},
			{label: "s3:GetObject"},
			{label: "s3:GetObjectAccessControlPolicy"},
			{label: "s3:GetObjectAcl"},
			{label: "s3:GetObjectExtended"},
			{label: "s3:GetObjectVersion"},
			{label: "s3:GetObjectVersionAcl"},
			{label: "s3:ListAllMyBuckets"},
			{label: "s3:ListBucket"},
			{label: "s3:ListBucketMultipartUploads"},
			{label: "s3:ListBucketVersions"},
			{label: "s3:ListMultipartUploadParts"},
			{label: "s3:PutBucketAcl"},
			{label: "s3:PutBucketLogging"},
			{label: "s3:PutBucketNotification"},
			{label: "s3:PutBucketPolicy"},
			{label: "s3:PutBucketRequestPayment"},
			{label: "s3:PutBucketVersioning"},
			{label: "s3:PutLifecycleConfiguration"},
			{label: "s3:PutObject"},
			{label: "s3:PutObjectAcl"},
			{label: "s3:PutObjectInline"},
			{label: "s3:PutObjectVersionAcl"},
			{label: "s3:SetBucketAccessControlPolicy"},
			{label: "s3:SetObjectAccessControlPolicy"}
		]);
		
		public static const EFFECTS:ArrayCollection = ([
			{label: "Allow"},
			{label: "Deny"}
		]);
		
		public function S3BucketPolicy(id:String=null, name:String=null, elementType:String=null)
		{
			super(id, name, elementType);
			elementGroup = ELEMENT_GROUP_RESOURCE;
			elementType = ResourceType.S3_BUCKET_POLICY;
		}
		
		override public function get properties():Object
		{
			properties = new Object()
			properties["PolicyDocument"] = policyDocument;
			properties["Bucket"] = bucket;
			return properties;
		}
		
		public function get policyDocument():Object
		{
			return {
				Version: version,
				Id: policyId,
				Statement: statement,
				Bucket: bucket;
			};
		}
		
		public function get statement():Object
		{
			return {
				Sid: sid,
				Action: action,
				Effect: effect,
				Resource: resource,
				Principal: principal
			};
		}
	}
}