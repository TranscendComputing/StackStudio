package com.momentumsi.c9.templates
{
	import com.momentumsi.c9.constants.PlatformConstants;
	import com.momentumsi.c9.constants.ResourceType;
	import com.momentumsi.c9.models.Element;
	
	import mx.collections.ArrayCollection;

	public class UbuntuChef extends ChefObject
	{
		public function UbuntuChef(roles:Array, chefServerUrl:Object=null, chefConfigBucket:Object=null)
		{
			super(roles, chefServerUrl, chefConfigBucket);
		}
		
		override public function get properties():Object
		{
			return {
				"Properties": {
					"UserData": {
						"Fn::Base64": {
							"Fn::Join": [
								"",
								[
									"#!/bin/bash -v\n",
									"# Helper functions\n",
									"function error_exit\n",
									"{\n",
									"  cfn-signal -e 1 -r \"$1\" '",waitHandle.toRef(),"'\n",
									"  exit 1\n",
									"}\n",
									"function retry_chef\n",
									"{\n",
									"chef-client -j /etc/chef/roles.json > /tmp/initialize_client.log 2>&1 || error_exit 'Failed to initialize host via chef client' \n",
									"}\n",
									"apt-get -y install python-setuptools\n",
									"easy_install https://s3.amazonaws.com/cloudformation-examples/aws-cfn-bootstrap-latest.tar.gz\n",
									"cfn-init -s ",
									{
										"Ref": "AWS::StackName"
									},
									" -r " + resourceName + 
									" --access-key ",userKeys.toRef(),
									" --secret-key ",userKeys.getSecretAccessKey(),
									" --region ",{"Ref": "AWS::Region"},
									" || error_exit 'Failed to run cfn-init'\n",
									"# Fixup path and links for the bootstrap script\n",
									"export PATH=$PATH:/var/lib/gems/1.8/bin\n",
									"# Bootstrap chef\n",
									"chef-solo -c /etc/chef/solo.rb -j /etc/chef/chef.json -r http://s3.amazonaws.com/chef-solo/bootstrap-latest.tar.gz > /tmp/chef-solo.log 2>&1 || error_exit 'Failed to bootstrap chef client'\n",
									"# Fixup the server URL in client.rb\n",
									"s3cmd -c /etc/s3cfg get s3://", installerBucket,"/validation.pem /etc/chef/validation.pem > /tmp/get_validation_key.log 2>&1 || error_exit 'Failed to get Chef Server validation key'\n",
									"sed -i 's|http://localhost:4000|http://",_chefServer, "|g' /etc/chef/client.rb\n",
									"chef-client -j /etc/chef/roles.json > /tmp/initialize_client.log 2>&1 || retry_chef \n",
									"\n",
									"# All is well so signal success\n",
									"cfn-signal -e 0 -r \" server setup complete\" '",waitHandle.toRef(),"'\n",
									"\n"
								]
							]
						}
					}
				},
				"DependsOn": bucketPolicyName,
				"Metadata": {
					"AWS::CloudFormation::Init": {
						"config": {
							"files": {
								"/var/lib/gems/1.8/gems/ohai-6.14.0/lib/ohai/plugins/cfn.rb": {
									"group": "root",
									"mode": "644",
									"owner": "root",
									"source": "https://s3.amazonaws.com/cloudformation-examples/cfn.rb"
								},
								"/etc/chef/chef.json": {
									"group": "root",
									"content": {
										"chef_client": {
											"server_url": _chefServer
										},
										"run_list": [
											"recipe[chef-client::config]",
											"recipe[chef-client]"
										]
									},
									"mode": "644",
									"owner": "root"
								},
								"/etc/chef/roles.json": {
									"group": "root",
									"content": {
										"run_list": runList
									},
									"mode": "644",
									"owner": "root"
								},
								"/etc/chef/solo.rb": {
									"group": "root",
									"content": {
										"Fn::Join": [
											"\n",
											[
												"file_cache_path \"/tmp/chef-solo\"",
												"cookbook_path \"/tmp/chef-solo/cookbooks\""
											]
										]
									},
									"mode": "644",
									"owner": "root"
								},
								"/etc/s3cfg": {
									"group": "root",
									"content": {
										"Fn::Join": [
											"",
											[
												"[default]\n",
												"access_key = ",userKeys.toRef(),"\n",
												"secret_key = ",userKeys.getSecretAccessKey(),"\n",
												"use_https = True\n"
											]
										]
									},
									"mode": "644",
									"owner": "root"
								}
							},
							"packages": {
								"apt": {
									"ruby-dev": [],
									"ruby": [],
									"libopenssl-ruby": [],
									"ssl-cert": [],
									"rdoc": [],
									"build-essential": [],
									"ri": [],
									"wget": [],
									"rubygems": [],
									"irb": [],
									"s3cmd": []
								},
								"rubygems": {
									"ohai": ["6.14.0"],
									"chef": []
								}
							}
						}
					},
					"AWS::CloudFormation::Authentication": {
						"S3AccessCreds": {
							"type": "S3",
							"buckets": [installerBucket],
							"accessKeyId": userKeys.toRef(),
							"secretKey": userKeys.getSecretAccessKey()
						}
					}
				}					
			}
		}
	}
}