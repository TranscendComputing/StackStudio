package com.momentumsi.c9.constants
{
	import mx.collections.ArrayCollection;

	public final class ResourceTypeMetricList
	{
		public static const AUTOSCALEMETRICLIST:ArrayCollection = new ArrayCollection([{label: "CPU Utilization", metricName: "CPUUtilization", unit: "Percent"},
																 {label: "Disk Read Ops", metricName: "DiskReadOps", unit: "Count"},
																 {label: "Disk Write Ops", metricName: "DiskWriteOps", unit: "Count"},
																 {label: "Disk Read Bytes", metricName: "DiskReadBytes", unit: "Bytes"},
																 {label: "Disk Write Bytes", metricName: "DiskWriteBytes", unit: "Bytes"},
																 {label: "Network In", metricName: "NetworkIn", unit: "Bytes"},
																 {label: "Network Out", metricName: "NetworkOut", unit: "Bytes"}]);
		
		public static const EC2METRICLIST:ArrayCollection = new ArrayCollection([{label: "CPU Utilization", metricName: "CPUUtilization", unit: "Percent"},
														   {label: "Disk Read Ops", metricName: "DiskReadOps", unit: "Count"},
														   {label: "Disk Write Ops", metricName: "DiskWriteOps", unit: "Count"},
														   {label: "Disk Read Bytes", metricName: "DiskReadBytes", unit: "Bytes"},
														   {label: "Disk Write Bytes", metricName: "DiskWriteBytes", unit: "Bytes"},
														   {label: "Network In", metricName: "NetworkIn", unit: "Bytes"},
														   {label: "Network Out", metricName: "NetworkOut", unit: "Bytes"}]);
		
		public static const EBSMETRICLIST:ArrayCollection = new ArrayCollection([{label: "Volume Read Bytes", metricName: "VolumeReadBytes", unit: "Bytes"},
														   {label: "Volume Write Bytes", metricName: "VolumeWriteBytes", unit: "Bytes"},
														   {label: "Volume Read Ops", metricName: "VolumeReadOps", unit: "Count"},
														   {label: "Volume Write Ops", metricName: "VolumeWriteOps", unit: "Count"},
														   {label: "Volume Total Read Time", metricName: "VolumeTotalReadTime", unit: "Seconds"},
														   {label: "Volume Total Write Time", metricName: "VolumeTotalWriteTime", unit: "Seconds"},
														   {label: "Volume Idle Time", metricName: "VolumeIdleTime", unit: "Seconds"},
														   {label: "Volume Queue Length", metricName: "VolumeQueueLength", unit: "Count"}]);
		
		public static const ELCMETRICLIST:ArrayCollection = new ArrayCollection([{label: "CPU Utilization", metricName: "CPUUtilization", unit: "Percent"},
														   {label: "Swap Usage", metricName: "SwapUsage", unit: "Bytes"},
														   {label: "Freeable Memory", metricName: "FreeableMemory", unit: "Bytes"},
														   {label: "Network Bytes In", metricName: "NetworkBytesIn", unit: "Bytes"},
														   {label: "Network Bytes Out", metricName: "NetworkBytesOut", unit: "Bytes"},
														   {label: "Bytes Used For Cache Items", metricName: "BytesUsedForCacheItems", unit: "Bytes"},
														   {label: "Bytes Read Into Memcached", metricName: "BytesReadIntoMemcached", unit: "Bytes"},
														   {label: "Check And Set Requests", metricName: "CasBadval", unit: "Count"},
														   {label: "Check And Set Hits", metricName: "CasHits", unit: "Count"},
														   {label: "Check And Set Misses", metricName: "CasMisses", unit: "Count"},
														   {label: "Flush Commands", metricName: "CmdFlush", unit: "Count"},
														   {label: "Get Commands", metricName: "CmdGet", unit: "Count"},
														   {label: "Set Commands", metricName: "CmdSet", unit: "Count"},
														   {label: "Current Connections", metricName: "CurrConnections", unit: "Count"},
														   {label: "Current Items", metricName: "CurrItems", unit: "Count"},
														   {label: "Decrement Hits", metricName: "DecrHits", unit: "Count"},
														   {label: "Decrement Misses", metricName: "DecrMisses", unit: "Count"},
														   {label: "Delete Hits", metricName: "DeleteHits", unit: "Count"},
														   {label: "Delete Misses", metricName: "DeleteMisses", unit: "Count"},
														   {label: "Evictions", metricName: "Evictions", unit: "Count"},
														   {label: "Get Hits", metricName: "GetHits", unit: "Count"},
														   {label: "Get Misses", metricName: "GetMisses", unit: "Count"},
														   {label: "Increment Hits", metricName: "IncrHits", unit: ""},
														   {label: "Increment Misses", metricName: "IncrMisses", unit: "Count"},
														   {label: "New Connections", metricName: "NewConnections", unit: "Count"},
														   {label: "New Items", metricName: "NewItems", unit: "Count"},
														   {label: "Reclaimed", metricName: "Reclaimed", unit: "Count"},
														   {label: "Unused Memory", metricName: "UnusedMemory", unit: "Bytes"}]);
		
		public static const ELBMETRICLIST:ArrayCollection = new ArrayCollection([{label: "Healthy Host Count", metricName: "HealthyHostCount", unit: "Count"},
														   {label: "Latency", metricName: "Latency", unit: "Seconds"},
														   {label: "Request Count", metricName: "RequestCount", unit: "Count"},
														   {label: "Unhealthy Host Count", metricName: "UnhealthyHostCount", unit: "Count"}]);
		
		public static const RDSMETRICLIST:ArrayCollection = new ArrayCollection([{label: "CPU Utilization", metricName: "CPUUtilization", unit: "Percent"},
														   {label: "Free Storage Space", metricName: "FreeStorageSpace", unit: "Bytes"},
														   {label: "Freeable Memory", metricName: "FreeableMemory", unit: "Bytes"},
														   {label: "Swap Usage", metricName: "SwapUsage", unit: "Bytes"},
														   {label: "Database Connections", metricName: "DatabaseConnections", unit: "Count"},
														   {label: "Read In/Out Ops", metricName: "ReadIOPS", unit: "Count/Second"},
														   {label: "Write In/Out Ops", metricName: "WriteIOPS", unit: "Count/Second"},
														   {label: "Read Latency", metricName: "ReadLatency", unit: "Seconds"},
														   {label: "Write Latency", metricName: "WriteLatency", unit: "Seconds"},
														   {label: "Read Throughput", metricName: "ReadThroughput", unit: "Bytes/Second"},
														   {label: "Write Throughput", metricName: "WriteThroughput", unit: "Bytes/Second"},
														   {label: "Bin Log Disk Usage", metricName: "BinLogDiskUsage", unit: "Bytes"},
														   {label: "Replica Lag", metricName: "ReplicaLag", unit: "Seconds"}]);
		
		public static const SNSMETRICLIST:ArrayCollection = new ArrayCollection([{label: "Number Of Messages Published", metricName: "NumberOfMessagesPublished", unit: "Count"},
														   {label: "Publish Size", metricName: "PublishSize", unit: "Bytes"},
														   {label: "Number Of Notifications Delivered", metricName: "NumberOfNotificationsDelivered", unit: "Count"},
														   {label: "Number Of Notifications Failed", metricName: "NumberOfNotificationsFailed", unit: "Count"}]);
		
		public static const SQSMETRICLIST:ArrayCollection = new ArrayCollection([{label: "Number Of Messages Sent", metricName: "NumberOfMessagesSent", unit: "Count"},
														   {label: "Sent Message Size", metricName: "SentMessageSize", unit: "Bytes"},
														   {label: "Number Of Messages Received", metricName: "NumberOfMessagesReceived", unit: "Count"},
														   {label: "Number Of Empty Receives", metricName: "NumberOfEmptyReceives", unit: "Count"},
														   {label: "Number Of Messages Deleted", metricName: "NumberOfMessagesDeleted", unit: "Count"},
														   {label: "Approximate Number Of Messages Delayed", metricName: "ApproximateNumberOfMessagesDelayed", unit: "Count"},
														   {label: "Approximate Number Of Messages Visible", metricName: "ApproximateNumberOfMessagesVisible", unit: "Count"},
														   {label: "Approximate Number Of Messages Not Visible", metricName: "ApproximateNumberOfMessagesNotVisible", unit: "Count"}]);
	}
}