package com.momentumsi.c9.constants
{
	public final class ResourceType
	{
		public static const AS_GROUP:String = "AWS::AutoScaling::AutoScalingGroup";
		public static const AS_TRIGGER:String = "AWS::AutoScaling::Trigger";
		public static const AS_POLICY:String = "AWS::AutoScaling::ScalingPolicy";
		public static const AS_LAUNCH_CONFIG:String = "AWS::AutoScaling::LaunchConfiguration";
		public static const CF_INIT:String = "AWS::CloudFormation::Init";
		public static const CF_AUTH:String = "AWS::CloudFormation::Authentication";
		public static const CLOUD_FRONT:String = "AWS::CloudFront::Distribution";
		public static const CW_ALARM:String = "AWS::CloudWatch::Alarm";
		public static const EBS_VOLUME:String = "AWS::EC2::Volume";
		public static const EBS_VOLUME_ATTACHMENT:String = "AWS::EC2::VolumeAttachment";
		public static const EC2_INSTANCE:String = "AWS::EC2::Instance";
		public static const EC2_SECURITY_GROUP:String = "AWS::EC2::SecurityGroup";
		public static const EMBEDDED_STACK:String = "AWS::CloudFormation::Stack";
		public static const CACHE_CLUSTER:String = "AWS::ElastiCache::CacheCluster";
		public static const CACHE_NODE:String = "AWS::ElastiCache::CacheNode";
		public static const CACHE_SECURITY_GROUP:String = "AWS::ElastiCache::SecurityGroup";
		public static const BEANSTALK_APP:String = "AWS::ElasticBeanstalk::Application";
		public static const BEANSTALK_ENV:String = "AWS::ElasticBeanstalk::Environment";
		public static const LOAD_BALANCER:String = "AWS::ElasticLoadBalancing::LoadBalancer";
		public static const ELASTIC_IP_ASSOC:String = "AWS::EC2::EIPAssociation";
		public static const ELASTIC_IP:String = "AWS::EC2::EIP";
		public static const IAM_GROUP:String = "AWS::IAM::Group";
		public static const IAM_USER:String = "AWS::IAM::User";
		public static const IAM_POLICY:String = "AWS::IAM::Policy";
		public static const IAM_USER_TO_GROUP:String = "AWS::IAM::UserToGroupAddition"
		public static const IAM_ACCESS_KEY:String = "AWS::IAM::AccessKey";
		public static const DB_INSTANCE:String = "AWS::RDS::DBInstance";
		public static const DB_SECURITY_GROUP:String = "AWS::RDS::DBSecurityGroup";
		public static const RECORD_SET:String = "AWS::Route53::RecordSet";
		public static const RECORD_SET_GROUP:String = "AWS::Route53::RecordSetGroup";
		public static const S3_BUCKET:String = "AWS::S3::Bucket";
		public static const S3_BUCKET_POLICY:String = "AWS::S3::BucketPolicy";
		public static const SIMPLE_DB_INSTANCE:String = "AWS::SDB::Domain";
		public static const SNS_TOPIC:String = "AWS::SNS::Topic";
		public static const SNS_POLICY:String = "AWS::SNS::TopicPolicy";
		public static const SQS_QUEUE:String = "AWS::SQS::Queue";
		public static const SQS_POLICY:String = "AWS::SQS::QueuePolicy";
		public static const WAIT_CONDITION:String = "AWS::CloudFormation::WaitCondition";
		public static const WAIT_CONDITION_HANDLE:String = "AWS::CloudFormation::WaitConditionHandle";
		

		public static const CHEF_ROLE:String = "Installs::Chef::Role"; 
		public static const PUPPET_MODULE:String = "Installs::Puppet::Module";
		
		public static const MAPPING:String = "Mapping";
	}
}