module ResourceTypes
	 AS_GROUP = "AWS::AutoScaling::AutoScalingGroup"
	 AS_TRIGGER = "AWS::AutoScaling::Trigger"
	 AS_POLICY = "AWS::AutoScaling::ScalingPolicy"
	 AS_LAUNCH_CONFIG = "AWS::AutoScaling::LaunchConfiguration"
	 CLOUD_FRONT = "AWS::CloudFront::Distribution"
	 EBS_VOLUME = "AWS::EC2::Volume"
	 EC2_INSTANCE = "AWS::EC2::Instance"
	 EC2_SECURITY_GROUP = "AWS::EC2::SecurityGroup"
	 CACHE_CLUSTER = "AWS::ElastiCache::CacheCluster"
	 CACHE_NODE = "AWS::ElastiCache::CacheNode"
	 CACHE_SECURITY_GROUP = "AWS::ElastiCache::SecurityGroup"
	 CW_ALARM = "AWS::CloudWatch::Alarm"
	 BEANSTALK_APP = "AWS::ElasticBeanstalk::Application"
	 BEANSTALK_ENV = "AWS::ElasticBeanstalk::Environment"
	 LOAD_BALANCER = "AWS::ElasticLoadBalancing::LoadBalancer"
	 IAM_GROUP = "AWS::IAM::Group"
	 IAM_USER = "AWS::IAM::User"
	 IAM_POLICY = "AWS::IAM::Policy"
	 IAM_USER_TO_GROUP = "AWS::IAM::UserToGroupAddition"
	 DB_INSTANCE = "AWS::RDS::DBInstance"
	 RECORD_SET = "AWS::Route53::RecordSet"
	 RECORD_SET_GROUP = "AWS::Route53::RecordSetGroup"
	 RDS_SECURITY_GROUP = "AWS::RDS::DBSecurityGroup"	 
	 S3_BUCKET = "AWS::S3::Bucket"
	 SNS_TOPIC = "AWS::SNS::Topic"
	 SQS_QUEUE = "AWS::SQS::Queue"
	 S3_BUCKET_POLICY = "AWS::S3::BucketPolicy"
	 SNS_POLICY = "AWS::SNS::TopicPolicy"
	 SQS_POLICY = "AWS::SQS::QueuePolicy"
	 WAIT_CONDITION = "AWS::CloudFormation::WaitCondition"

	 SUPPORTED_NODES = [
		AS_GROUP,
		CLOUD_FRONT,
		EBS_VOLUME,
		EC2_INSTANCE,
		EC2_SECURITY_GROUP,
		CACHE_CLUSTER,
		BEANSTALK_APP,
		LOAD_BALANCER,
		IAM_GROUP,
		IAM_USER,
		DB_INSTANCE,
		RECORD_SET,
		S3_BUCKET,
		SNS_TOPIC,
		SQS_QUEUE,
		S3_BUCKET_POLICY,
		SNS_POLICY,
		SQS_POLICY,
		WAIT_CONDITION
	 ]

end
