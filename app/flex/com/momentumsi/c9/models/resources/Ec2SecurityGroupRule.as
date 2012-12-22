package com.momentumsi.c9.models.resources
{
	import mx.collections.ArrayCollection;

	[Bindable]
	public class Ec2SecurityGroupRule
	{		
		private static const ECHO_REPLY_CODES:ArrayCollection = new ArrayCollection([
			{code: 0, description: "echo reply"}
		]);
		private static const DESTINATION_UNREACHABLE_CODES:ArrayCollection = new ArrayCollection([
			{code: -1, description: "ALL"},
			{code: 0, description: "destination network unreachable"},
			{code: 1, description: "destination host unreachable"},
			{code: 2, description: "destination protocol unreachable"},
			{code: 3, description: "destination port unreachable"},
			{code: 4, description: "fragmentation required, and DF flag set"},
			{code: 5, description: "source route failed"},
			{code: 6, description: "destination network unknown"},
			{code: 7, description: "destination host unknown"},
			{code: 8, description: "source host isolated"},
			{code: 9, description: "network administratively prohibited"},
			{code: 10, description: "host administratively prohibited"},
			{code: 11, description: "network unreachable for TOS"},
			{code: 12, description: "host unreachable for TOS"},
			{code: 13, description: "communication administratively prohibited"},
			{code: 14, description: "host precendence violation"},
			{code: 15, description: "precendence cutoff in effect"}
		]);
		private static const SOURCE_QUECH_CODES:ArrayCollection = new ArrayCollection([
			{code: 0, description: "source quench (congestion control)"}
		]);
		private static const REDIRECT_MESSAGE_CODES:ArrayCollection = new ArrayCollection([
			{code: -1, description: "ALL"},
			{code: 0, description: "redirect datagram for the network"},
			{code: 1, description: "redirect datagram for the host"},
			{code: 2, description: "redirect datagram for the TOS & network"},
			{code: 3, description: "redirect datagram for the TOS & host"}
		]);
		private static const ALT_HOST_ADDR_CODE:ArrayCollection = new ArrayCollection([
			{code: -1}
		]);
		private static const ECHO_REQUEST_CODES:ArrayCollection = new ArrayCollection([
			{code: 0, description: "echo request"}
		]);
		private static const ROUTER_AD_CODE:ArrayCollection = new ArrayCollection([
			{code: 0, description: "router advertisement"}
		]);
		private static const ROUTER_SOLICITATION_CODE:ArrayCollection = new ArrayCollection([
			{code: 0, description: "router discovery/selection/solicitation"}
		]);
		private static const TIME_EXCEEDED_CODES:ArrayCollection = new ArrayCollection([
			{code: -1, description: "ALL"},
			{code: 0, description: "TTL expired in transit"},
			{code: 1, description: "fragment reassembly time exceeded"}
		]);
		private static const PARAMETER_PROBLEM_CODES:ArrayCollection = new ArrayCollection([
			{code: -1, description: "ALL"},
			{code: 0, description: "pointer indicates the error"},
			{code: 1, description: "missing a required option"},
			{code: 2, description: "bad length"}
		]);
		private static const TIMESTAMP_CODE:ArrayCollection = new ArrayCollection([
			{code: 0, description: "timestamp"}
		]);
		private static const TIMESTAMP_REPLY_CODE:ArrayCollection = new ArrayCollection([
			{code: 0, description: "timestamp reply"}
		]);
		private static const INFORMATION_REQUEST_CODE:ArrayCollection = new ArrayCollection([
			{code: 0, description: "information request"}
		]);
		private static const INFORMATION_REPLY_CODE:ArrayCollection = new ArrayCollection([
			{code: 0, description: "information reply"}
		]);
		private static const ADDR_MASK_REQUEST_CODE:ArrayCollection = new ArrayCollection([
			{code: 0, description: "address mask request"}
		]);
		private static const ADDR_MASK_REPLY_CODE:ArrayCollection = new ArrayCollection([
			{code: 0, description: "address mask reply"}
		]);
		private static const TRACEROUTE_CODE:ArrayCollection = new ArrayCollection([
			{code: 0, description: "information request"}
		]);
		private static const DATAGRAM_CONV_ERROR_CODE:ArrayCollection = new ArrayCollection([
			{code: -1, description: "datagram conversion error"}
		]);
		private static const MOBILE_HOST_CODE:ArrayCollection = new ArrayCollection([
			{code: -1, description: "mobile host redirect"}
		]);
		private static const WHERE_ARE_YOU_CODE:ArrayCollection = new ArrayCollection([
			{code: -1, description: "where are you"}
		]);
		private static const HERE_I_AM_CODE:ArrayCollection = new ArrayCollection([
			{code: -1, description: "here i am"}
		]);
		private static const MOBILE_REG_REQ_CODE:ArrayCollection = new ArrayCollection([
			{code: -1, description: "mobile registration request"}
		]);
		private static const MOBILE_REG_REPLY_CODE:ArrayCollection = new ArrayCollection([
			{code: -1, description: "mobile registration reply"}
		]);
		private static const DOMAIN_NAME_REQ_CODE:ArrayCollection = new ArrayCollection([
			{code: -1, description: "domain name request"}
		]);
		private static const DOMAIN_NAME_REPLY_CODE:ArrayCollection = new ArrayCollection([
			{code: -1, description: "domain name reply"}
		]);
		private static const SKIP_CODE:ArrayCollection = new ArrayCollection([
			{code: -1, description: "skip algorithm discovery protocol"}
		]);
		private static const PHOTURIS_CODE:ArrayCollection = new ArrayCollection([
			{code: -1, description: "photuris, security failures"}
		]);
		
		public static const ICMP_TYPES:ArrayCollection = new ArrayCollection([
			{type: 0, label: "Echo Reply", codes: ECHO_REPLY_CODES},
			{type: 3, label: "Destination Unreachable", codes: DESTINATION_UNREACHABLE_CODES},
			{type: 4, label: "Source Quench", codes: SOURCE_QUECH_CODES},
			{type: 5, label: "Redirect Message", codes: REDIRECT_MESSAGE_CODES},
			{type: 6, label: "Alternate Host Address", codes: ALT_HOST_ADDR_CODE},
			{type: 8, label: "Echo Request", codes: ECHO_REQUEST_CODES},
			{type: 9, label: "Router Advertisement", codes: ROUTER_AD_CODE},
			{type: 10, label: "Router Solicitation", codes: ROUTER_SOLICITATION_CODE},
			{type: 11, label: "Time Exceeded", codes: TIME_EXCEEDED_CODES},
			{type: 12, label: "Parameter Problem: Bad IP header", codes: PARAMETER_PROBLEM_CODES},
			{type: 13, label: "Timestamp", codes: TIMESTAMP_CODE},
			{type: 14, label: "Timestamp Reply", codes: TIMESTAMP_REPLY_CODE},
			{type: 15, label: "Information Request", codes: INFORMATION_REQUEST_CODE},
			{type: 16, label: "Information Reply", codes: INFORMATION_REPLY_CODE},
			{type: 17, label: "Address Mask Request", codes: ADDR_MASK_REQUEST_CODE},
			{type: 18, label: "Address Mask Reply", codes: ADDR_MASK_REPLY_CODE},
			{type: 30, label: "Traceroute", codes: TRACEROUTE_CODE},
			{type: 31, label: "Datagram Conversion Error", codes: DATAGRAM_CONV_ERROR_CODE},
			{type: 32, label: "Mobile Host Redirect", codes: MOBILE_HOST_CODE},
			{type: 33, label: "Where Are You", codes: WHERE_ARE_YOU_CODE},
			{type: 34, label: "Here I Am", codes: HERE_I_AM_CODE},
			{type: 35, label: "Mobile Registration Request", codes: MOBILE_REG_REQ_CODE},
			{type: 36, label: "Mobile Registration Reply", codes: MOBILE_REG_REPLY_CODE},
			{type: 37, label: "Domain Name Request", codes: DOMAIN_NAME_REQ_CODE},
			{type: 38, label: "Domain Name Reply", codes: DOMAIN_NAME_REPLY_CODE},
			{type: 39, label: "SKIP Algorithm Discovery Protocol", codes: SKIP_CODE},
			{type: 40, label: "Photuris, Security Failures", codes: PHOTURIS_CODE}
			
		]);
		
		
		
			
		public var ipProtocol:String;
		public var cidrip:String;
		public var sourceSecurityGroupName:Object;
		public var sourceSecurityGroupId:Object;
		public var sourceSecurityGroupOwnerId:Object;
		public var fromPort:Object;
		public var toPort:Object;
		
		public function Ec2SecurityGroupRule(data:Object=null)			
		{
			if(data != null)
			{				
				ipProtocol = data.IpProtocol;
				cidrip = data.CidrIp;
				sourceSecurityGroupName = data.SourceSecurityGroupName;
				sourceSecurityGroupId = data.SourceSecurityGroupId;
				sourceSecurityGroupOwnerId = data.SourceSecurityGroupOwnerId;
				fromPort = data.FromPort;
				toPort = data.ToPort;
			}
		}
		
		public function get source():String 
		{
			if(cidrip != null)
			{
				return cidrip;
			}else
			{
				return sourceSecurityGroupOwnerId + "/" + sourceSecurityGroupId + " (" + sourceSecurityGroupName + ")";
			}
		}
		
		public function get port():Object
		{
			if(ipProtocol == "icmp")
			{
				for each(var item:Object in ICMP_TYPES)
				{
					if(item.type == fromPort)
					{
						for each(var code:Object in item.codes)
						{
							if(code.code == toPort)
							{
								if(item.codes.length > 1)
								{
									return item.label + "/" + code.description;
								}
								return item.label;
							}
						}
					}
				}
			}else{
				var toPortStr:String = "";
				if(toPort is String)
				{
					toPortStr = toPort.toString();
				}else if(toPort.hasOwnProperty("Ref"))
				{
					toPortStr = toPort.Ref;
				}
				
				var fromPortStr:String = "";
				if(fromPort is String)
				{
					fromPortStr = fromPort.toString();
				}else if(fromPort.hasOwnProperty("Ref"))
				{
					fromPortStr = fromPort.Ref;
				}
				
				if(toPortStr != fromPortStr)
				{
					return fromPortStr + "-" + toPortStr;
				}
				
				return fromPort;
			}
			return new String();
		}
		
		public function equals(otherRule:Ec2SecurityGroupRule):Boolean
		{
			if(otherRule.ipProtocol == this.ipProtocol &&
				otherRule.fromPort == this.fromPort &&
				otherRule.toPort == this.toPort &&
				otherRule.cidrip == this.cidrip && 
				otherRule.sourceSecurityGroupOwnerId == this.sourceSecurityGroupOwnerId && 
				(otherRule.sourceSecurityGroupName == this.sourceSecurityGroupName || otherRule.sourceSecurityGroupId == this.sourceSecurityGroupId)){
				return true;
			}else{
				return false;
			}
		}
		
		public function toObject():Object
		{
			var returnObj:Object = new Object();
			returnObj.IpProtocol = ipProtocol;
			returnObj.FromPort = fromPort;
			returnObj.ToPrt = toPort;
			if(cidrip != null)
			{
				returnObj.CidrIp = cidrip;
			}
			if(sourceSecurityGroupId != null)
			{
				returnObj.SourceSecurityGroupId = sourceSecurityGroupId;				
			}
			if(sourceSecurityGroupName != null)
			{				
				returnObj.SourceSecurityGroupName = sourceSecurityGroupName;
			}
			if(sourceSecurityGroupOwnerId != null)
			{
				returnObj.SourceSecurityGroupOwnderId = sourceSecurityGroupOwnerId;
			}
			return returnObj;
		}
	}
}