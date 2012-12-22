package com.momentumsi.c9.templates
{
	import com.momentumsi.c9.constants.ResourceType;
	import com.momentumsi.c9.models.Element;
	import com.momentumsi.c9.models.resources.IamAccessKey;
	import com.momentumsi.c9.models.resources.WaitCondition;
	import com.momentumsi.c9.models.resources.WaitHandle;

	public class InstallObject implements IInstallObject
	{
		public var user:Element;
		public var userKeys:IamAccessKey;
		public var waitHandle:WaitHandle;
		public var waitCondition:WaitCondition;
		public var resourceName:String; 
		public var bucketPolicyName:String = "BucketPolicy";
		public var roles:Array;
		public var serverUrl:Object;
		public var installerBucket:Object = {Ref: "InstallerBucket"};
		
		public function InstallObject(resourceType:String, roles:Array, serverUrl:Object, installerBucket:Object=null)
		{
			if(resourceType == ResourceType.PUPPET_MODULE)
			{
				user = GeneratedObject.getPuppetUser();
			}else if(resourceType == ResourceType.CHEF_ROLE)
			{
				user = GeneratedObject.getChefUser();
			}
			if(installerBucket != null)
			{
				this.installerBucket = installerBucket;
			}
			if(roles != null)
			{
				this.roles = roles;
			}else{
				this.roles = [];
			}
			this.serverUrl = serverUrl; 	
			userKeys = new IamAccessKey(user.toRef());
			waitHandle = new WaitHandle();
		}
		
		public function getServerWaitCondition(timeout:String=null,waitName:String=null):WaitCondition
		{
			var _waitCondition:WaitCondition = new WaitCondition(resourceName, waitHandle.toRef(), timeout, waitName);
			return _waitCondition;
		}
		
		public function addRole(name:String):void
		{
			this.roles.push(name);
		}
		
		public function get properties():Object
		{
			return {
				"Metadata" : {
					"AWS::CloudFormation::Init" : {
						"config" : {
							"packages" : {},
							"files" : {}
						}
					}
				},
				"Properties": {
					"UserData" : { "Fn::Base64" : { "Fn::Join" : ["", [
						"#!/bin/bash\n"
					]]}}
				}
			}
		}
		
		public function get metadata():Object
		{
			return properties["Metadata"];
		}
		
		public function get userdata():Object
		{
			return properties["Properties"]["UserData"];
		}
			
		public function get installerBucketPolicy():Element
		{
			var newBucketPolicy:Element = new Element();
			newBucketPolicy.name = bucketPolicyName;
			newBucketPolicy.elementGroup = Element.ELEMENT_GROUP_RESOURCE;
			newBucketPolicy.elementType = ResourceType.S3_BUCKET_POLICY;
			newBucketPolicy.properties = {
				Type: ResourceType.S3_BUCKET_POLICY,
					Properties: {
						PolicyDocument:{
							Version: "2008-10-17",
							Id: "ReadPolicy",
							Statement: [{
								Sid: "ReadAccess",
								Action: ["s3:GetObject"],
								Effect: "Allow",
								Resource: "arn:aws:s3:::" + this.installerBucket + "/*",
								Principal: {"AWS": {"Fn::GetAtt": [user.name, "Arn"]}}
							}]
						},
						Bucket: this.installerBucket
					}				
			};
			
			return newBucketPolicy;
		}	
		
	}
}