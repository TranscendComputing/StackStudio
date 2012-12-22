package com.momentumsi.c9.templates
{
	import com.momentumsi.c9.constants.PlatformConstants;
	import com.momentumsi.c9.constants.ResourceType;

	public class UbuntuPuppet extends PuppetObject
	{
		public function UbuntuPuppet(roles:Array, puppetMasterUrl:Object=null, puppetConfigBucket:Object=null)
		{
			super(roles, puppetMasterUrl, puppetConfigBucket);
		}
		
		override public function get properties():Object
		{
			return {
				"Metadata" : {
					"AWS::CloudFormation::Init" : {
						"config" : {
							"packages": {
								"apt": {
									"s3cmd": [],
									"build-essential" : []
								}
							},
							"files" : {
								"/etc/.puppet_install_answers" : {
									"content" : { "Fn::Join" : ["", [
										"q_install=y\n",
										"q_puppet_cloud_install=y\n",
										"q_puppet_enterpriseconsole_install=n\n",
										"q_puppet_symlinks_install=y\n",
										"q_puppetagent_certname=",resourceName, puppetAgentDomain,"\n",
										"q_puppetagent_install=y\n",
										"q_puppetagent_server=",_puppetMaster,"\n",
										"q_fail_on_unsuccessful_master_lookup=y\n",
										"q_puppetmaster_install=n\n",
										"q_vendor_packages_install=y"
									]] },
									"mode" : "000644",
									"owner" : "root",
									"group" : "root"
								},
								"/root/.s3cfg": {
									"group": "root",
									"content": {
										"Fn::Join": [
											"",
											[
												"[default]\n",
												"access_key = ", userKeys.toRef(),"\n",
												"secret_key = ",userKeys.getSecretAccessKey(),"\n",
												"use_https = True\n"
											]
										]
									},
									"mode": "644",
									"owner": "root"
								}
							}
						}
					},
					"Puppet" : {
						"roles"    : roles
					},
					"AWS::CloudFormation::Authentication": {
						"S3AccessCreds": {
							"type": "S3",
							"buckets": [installerBucket],
							"accessKeyId": userKeys.toRef(),
							"secretKey": userKeys.getSecretAccessKey()
						}
					}
				},
				"Properties": {
					"UserData" : { "Fn::Base64" : { "Fn::Join" : ["", [
						"#!/bin/bash -v\n",
						"# Helper functions\n",
						"function error_exit\n",
						"{\n",
						"  /opt/aws/bin/cfn-signal -e 1 -r \"$1\" '",waitHandle.toRef(),"'\n",
						"  exit 1\n",
						"}\n",
						"apt-get -y install python-setuptools\n",
						"easy_install https://s3.amazonaws.com/cloudformation-examples/aws-cfn-bootstrap-latest.tar.gz\n",
						"wget http://apt-enterprise.puppetlabs.com/puppetlabs-enterprise-release-extras_1.0-2_all.deb\n",
						"dpkg -i puppetlabs-enterprise-release-extras_1.0-2_all.deb\n",
						"apt-get update\n",
						"$(which cfn-init) --region ", { "Ref" : "AWS::Region" },
						"    -s ", { "Ref" : "AWS::StackName" }, " -r ", resourceName,
						"    --access-key ", userKeys.toRef(),
						"    --secret-key ", userKeys.getSecretAccessKey(), "\n",
						"s3cmd -c /root/.s3cfg get s3://", installerBucket, "/", puppetPeInstall, " /root/", puppetPeInstall, " > /tmp/get_puppet_install.log 2>&1 || error_exit 'Failed to get Puppet install tar'\n",
						"cd /root; tar zxvf ", puppetPeInstall, "\n",
						"cd /root/puppet*;sh puppet-enterprise-installer -a /etc/.puppet_install_answers > puppet_install.log 2>&1 || error_exit 'Failed to install Puppet'\n",
						"apt-get install pe-rubygem-json -y\n",
						"/opt/puppet/bin/puppet agent -o --no-daemonize\n",
						"$(which cfn-init) -e $? '", waitHandle.toRef() , "'\n"
					]]}}
				}
			}
		}
	}
}