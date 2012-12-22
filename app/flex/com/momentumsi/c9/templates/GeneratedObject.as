package com.momentumsi.c9.templates
{
	import com.momentumsi.c9.constants.ResourceType;
	import com.momentumsi.c9.models.Element;
	import com.momentumsi.c9.models.resources.IamAccessKey;

	public final class GeneratedObject
	{
		public static function getChefUser():Element
		{
			var chefUser:Element = new Element();
			chefUser.elementGroup = Element.ELEMENT_GROUP_RESOURCE;
			chefUser.elementType = ResourceType.IAM_USER;
			chefUser.name = "ChefClientUser";
			chefUser.properties = {
				Type: ResourceType.IAM_USER, 
					Properties: {
						Path: "/",
						Policies: [{
							PolicyName: "root",
							PolicyDocument:{
								Statement:
								[{
									Effect: "Allow",
									Action:
									[
										"cloudformation:DescribeStackResource",
										"s3:GetObject"
									],
									Resource: "*"
								}]
							}
						}]
					}
			};
			return chefUser;
		}
		
		public static function getPuppetUser():Element
		{
			var puppetUser:Element = new Element();
			puppetUser.elementGroup = Element.ELEMENT_GROUP_RESOURCE;
			puppetUser.elementType = ResourceType.IAM_USER;
			puppetUser.name = "PuppetClientUser";
			puppetUser.properties = {
				Type : ResourceType.IAM_USER,
				Properties : {
					Policies: [{
						PolicyName: "AccessForCFNInit",
						PolicyDocument : {
							Statement: [{
								Effect   : "Allow",
								Action   : "cloudformation:DescribeStackResource",
								Resource : "*"
							}]
						}
					}]
				}
			};
			return puppetUser;	
		}
	}
}