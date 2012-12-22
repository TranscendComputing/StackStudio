package com.momentumsi.c9.templates
{
	import com.momentumsi.c9.utils.IntrinsicFunctionUtil;

	public class DefaultUserDataObject
	{
		public var data:Object = new Object();
		public var serverName:String = "NewServer";
		public var userKeys:String = "HostKeys";
		public var waitHandle:String = "WAITHANDLE";
		
		public function DefaultUserDataObject()
		{
			var coreContent:Array = new Array();
			coreContent.push("#!/bin/bash -v\n");
			coreContent.push("# Helper function\n");
			coreContent.push("function error_exit\n");
			coreContent.push("{\n");
			coreContent.push("  /opt/aws/bin/cfn-signal -e 1 -r \"$1\" '");
			coreContent.push({ Ref: waitHandle });
			coreContent.push( "'\n");
			coreContent.push("  cat /tmp/cfn-error.txt | tee /root/cfn-error.txt\n");
			coreContent.push("}\n");
			coreContent.push("# Run cloudformation init\n");
			coreContent.push("trap \"rm -f /tmp/cfn-error.txt\" 0 1 2 3 15\n");
			coreContent.push("/opt/aws/bin/cfn-init");
			coreContent.push(" -s ");
			coreContent.push({ Ref: "AWS::StackName" });
			var serverReference:String = " -r " + serverName;
			coreContent.push(serverReference);
			coreContent.push(" --access-key ");
			coreContent.push({ Ref: userKeys });
			coreContent.push(" --secret-key ");
			var secretKeyReference:Object = new Object();
			secretKeyReference[IntrinsicFunctionUtil.GET_ATT] = [userKeys, "SecretAccessKey"];
			coreContent.push(secretKeyReference);
			coreContent.push(" --region ");
			coreContent.push({ Ref: "AWS::Region" });
			coreContent.push(" 2>/tmp/cfn-error.txt || error_exit \"$(</tmp/cfn-error.txt)\"\n");
			coreContent.push("\n");
			coreContent.push("# All is well so signal success\n");
			coreContent.push("/opt/aws/bin/cfn-signal -e 0 -r \" server setup complete\" '");
			coreContent.push( { Ref: waitHandle });
			coreContent.push("'\n");
			
			var joinedContent:Object = new Object();
			joinedContent[IntrinsicFunctionUtil.JOIN] = ["", coreContent];
			
			data = new Object();
			data[IntrinsicFunctionUtil.BASE_64] = joinedContent;
			
			/*data = {"Fn::Base64":
				{ "Fn::Join": [ "", [
					"#!/bin/bash -v\n",
					"# Helper function\n",
					"function error_exit\n",
					"{\n",
					"  /opt/aws/bin/cfn-signal -e 1 -r \"$1\" '", { Ref: "WAITHANDLE" }, "'\n",
					"  cat /tmp/cfn-error.txt | tee /root/cfn-error.txt\n",
					"  exit 1\n",
					"}\n",
					"\n",
					"# Run cloudformation init\n",
					"trap \"rm -f /tmp/cfn-error.txt\" 0 1 2 3 15\n",
					"/opt/aws/bin/cfn-init",
					" -s ", { Ref: "AWS::StackName" },
					" -r NewServer",
					" --access-key ", { Ref: "HostKeys" },
					" --secret-key ", {'Fn::GetAtt': ["HostKeys", "SecretAccessKey"]},
					" --region ", { Ref: "AWS::Region" },
					" 2>/tmp/cfn-error.txt || error_exit \"$(</tmp/cfn-error.txt)\"\n",
					"\n",
					"# All is well so signal success\n",
					"/opt/aws/bin/cfn-signal -e 0 -r \" server setup complete\" '", { Ref: "WAITHANDLE" }, "'\n"
				]]}
			}*/
		}
				
	}
}