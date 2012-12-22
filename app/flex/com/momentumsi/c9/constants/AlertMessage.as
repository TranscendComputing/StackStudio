package com.momentumsi.c9.constants
{
	public final class AlertMessage
	{
		/***************************
		 * 		Default Messages
		 * *************************/
		
		public static const INVALID:String = "Invalid input";
		public static const NOTALPHANUMERIC:String = "This field must be alphanumeric";
		public static const NOT_UNIQUE:String = "This field must be unique"
		public static const NOTNUMBER:String = "This field must be a number";
		public static const ALLFIELDSREQUIRED:String = "Please complete all required fields.";
		public static const SELECTIMAGE:String = "You must select an image to continue.";
		public static const SELECT_ACCOUNT:String = "You must select an account to continue.";
		public static const UNABLE_TO_CREATE:String = "Unable to create resource at this time.";
		public static const PROJECT_NOT_UNIQUE:String = "Project name must be unique.";
		public static const PERMISSION_DENIED:String = "You do not have permission to perform this action.";
		public static const CLOUD_UNAVAILABLE:String = "You do not have a cloud account set up for the attempted cloud.";
		public static const NOTALPHANUMERIC_STACK_NAME:String = "StackName must be alphanumeric.";
		public static const CONFIGURE_OBJECTS:String = "Configure all objects before promoting to deploy view.";
		
		// Default error codes
		public static const API_ERROR:String = "Api Error";
		
		// Volume error messages
		public static const INVALID_DEVICE:String = "Invalid device specified";
		
		// Load balancer error messages
		public static const REGISTER_FAILED:String = "Failed to add the instance to load balancer.";
		
		//Security group messages
		public static const SEC_GROUP_DEFAULT:String = "Name and description are required.";
		
		/***************************
		 * 		Project Service Fault Messages
		 * *************************/
		
		/**
		 * FREEZE_VERSION_400 fault message.
		 *
		 * <p>This error message is displayed when an error occurs for a freeze version action</p>
		 * <table class="innertable">
		 *     <tr><th>Property</th><th>Value</th></tr>
		 *     <tr><td><code>message1</code></td><td>Number can't be blank</td></tr>
		 *     <tr><td><code>message2</code></td><td>Number format must be major.minor.micro</td></tr>
		 *     <tr><td><code>status code</code></td><td>400</td></tr>
		 *  </table>
		 *  @faultType freezeVersion 
		 *  
		 */
		public static const FREEZE_VERSION_400:String = "Number can't be blank.  Number format must be major.minor.micro";
		
		/**
		 * FREEZE_VERSION_DEFAULT fault message.
		 *
		 * <p>This error message is displayed when an unknown error occurs for a freeze version action</p>
		 * <table class="innertable">
		 *     <tr><th>Property</th><th>Value</th></tr>
		 *     <tr><td><code>message1</code></td><td>Unable to assign version number</td></tr>
		 *     <tr><td><code>status code</code></td><td>UNKNOWN</td></tr>
		 *  </table>
		 *  @faultType freezeVersion 
		 * 
		 */
		public static const FREEZE_VERSION_DEFAULT:String = "Unable to assign version number";
		
		/***************************
		 * 		Identity Service Fault Messages
		 * *************************/
		
		/**
		 * LOGIN_400 fault message.
		 *
		 * <p>This error message is displayed when a 400 error occurs for a login action</p>
		 * <table class="innertable">
		 *     <tr><th>Property</th><th>Value</th></tr>
		 *     <tr><td><code>message1</code></td><td>Login and password required</td></tr>
		 *     <tr><td><code>status code</code></td><td>400</td></tr>
		 *  </table>
		 *  @faultType login 
		 * 
		 */
		public static const LOGIN_400:String = "Login and password required";
		
		/**
		 * LOGIN_401 fault message.
		 *
		 * <p>This error message is displayed when a 401 error occurs for a login action</p>
		 * <table class="innertable">
		 *     <tr><th>Property</th><th>Value</th></tr>
		 *     <tr><td><code>message1</code></td><td>Invalid login or password</td></tr>
		 *     <tr><td><code>status code</code></td><td>401</td></tr>
		 *  </table>
		 *  @faultType login 
		 * 
		 */
		public static const LOGIN_401:String = "Invalid login or password";
		
		/**
		 * LOGIN_DEFAULT fault message.
		 *
		 * <p>This error message is displayed when an unknown error occurs for a login action</p>
		 * <table class="innertable">
		 *     <tr><th>Property</th><th>Value</th></tr>
		 *     <tr><td><code>message1</code></td><td>Unable to login</td></tr>
		 *     <tr><td><code>status code</code></td><td>UNKNOWN</td></tr>
		 *  </table>
		 *  @faultType login 
		 * 
		 */
		public static const LOGIN_DEFAULT:String = "Unable to login";
		
		/**
		 * ERROR_CONNECTING_CLOUD fault message.
		 *
		 * <p>This error message is displayed when an unknown error occurs for connecting to a cloud in cloud management tab</p>
		 * <table class="innertable">
		 *     <tr><th>Property</th><th>Value</th></tr>
		 *     <tr><td><code>message1</code></td><td>Error connecting to cloud</td></tr>
		 *     <tr><td><code>status code</code></td><td>UNKNOWN</td></tr>
		 *  </table>
		 *  @faultType login 
		 * 
		 */
		public static const ERROR_CONNECTING_CLOUD:String = "Error connecting to cloud.";
	}
}