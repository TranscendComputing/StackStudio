package com.momentumsi.c9.constants
{
	import mx.collections.ArrayCollection;

	[Bindable]
	public final class PlatformConstants
	{
		public static const AMAZON_LINUX:String = "AmazonLinux";
		public static const UBUNTU:String = "Ubuntu";
		public static const REDHAT_LINUX:String = "Redhat";
		public static const AWS_LINUX:String = "Amazon";
		
		public static const LINUX:String = "Linux/UNIX";
		public static const LINUX_VPC:String = "Linux/UNIX (Amazon VPC)";
		public static const SUSE_LINUX:String = "SUSE Linux";
		public static const SUSE_LINUX_VPC:String = "SUSE Linux (Amazon VPC)";
		public static const REDHAT:String = "Red Hat Enterprise Linux";
		public static const REDHAT_VPC:String = "Red Hat Enterprise Linux (Amazon VPC)";
		public static const WINDOWS:String = "Windows";
		public static const WINDOWS_VPC:String = "Windows (Amazon VPC)";
		public static const WINDOWS_SQL:String = "Windows with SQL Server";
		public static const WINDOWS_SQL_VPC:String = "Windows with SQL Server (Amazon VPC)";
		public static const WINDOWS_SQL_STANDARD:String = "Windows with SQL Server Standard";
		public static const WINDOWS_SQL_STANDARD_VPC:String = "Windows with SQL Server Standard (Amazon VPC)";
		public static const WINDOWS_SQL_WEB:String = "Windows with SQL Server Web";
		public static const WINDOWS_SQL_WEB_VPC:String = "Windows with SQL Server Web (Amazon VPC)";
		
		//Reserved instance platforms
		public static const RESERVED_INSTANCE_PLATFORMS:ArrayCollection = new ArrayCollection([
			LINUX, LINUX_VPC,
			SUSE_LINUX, SUSE_LINUX_VPC,
			REDHAT, REDHAT_VPC,
			WINDOWS, WINDOWS_VPC,
			WINDOWS_SQL, WINDOWS_SQL_VPC,
			WINDOWS_SQL_STANDARD, WINDOWS_SQL_STANDARD_VPC,
			WINDOWS_SQL_WEB, WINDOWS_SQL_WEB_VPC
		]);
	}
}