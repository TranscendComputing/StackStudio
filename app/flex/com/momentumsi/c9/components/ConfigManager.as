package com.momentumsi.c9.components
{
	import com.momentumsi.c9.events.ConfigManagerEvent;
	
	import flash.events.Event;
	import flash.events.EventDispatcher;
	import flash.events.IEventDispatcher;
	import flash.events.IOErrorEvent;
	import flash.events.SecurityErrorEvent;
	import flash.net.URLLoader;
	import flash.net.URLRequest;
	
	import mx.controls.Alert;
	
	[Event(name="complete", type="com.momentumsi.c9.events.ConfigManagerEvent")]
	[Event(name="fault", type="com.momentumsi.c9.events.ConfigManagerEvent")]	
	public class ConfigManager extends EventDispatcher
	{
		private var _configFile:String;
		private var _xml:XML;
		private var _loader:URLLoader;
		private var _initialized:Boolean;
		private var _cmEvent:ConfigManagerEvent;
				
		public function ConfigManager( configFile:String )
		{
			_initialized = false ;
			super();
			
			_configFile = configFile ;
		}
		
		public function loadConfig():void 
		{		
			var request:URLRequest = new URLRequest(_configFile);
			_loader = new URLLoader();
			
			// add some event listeners
			_loader.addEventListener(Event.COMPLETE,onComplete);
			_loader.addEventListener(IOErrorEvent.IO_ERROR,onError);
			_loader.addEventListener(SecurityErrorEvent.SECURITY_ERROR,onError);
			
			// try to load the xml file 
			try 
			{
				_loader.load(request);
			}
			catch (e:Error) 
			{
				Alert.show("The system cannot load StackStudio's configuration file.  Please contact your administrator." ,"Load Settings Error");
				_cmEvent = new ConfigManagerEvent(ConfigManagerEvent.COMPLETE);
				dispatchEvent(_cmEvent);
			}
		}
		
		public function onError(event:Event):void
		{
			Alert.show("The system cannot connect at the time.  Please check you config.xml file or contact your administrator." ,event.type);	
			_cmEvent = new ConfigManagerEvent(ConfigManagerEvent.COMPLETE);
			dispatchEvent(_cmEvent);
		}
		
		public function onComplete(event:Event):void 
		{
			//Alert.show("OnComplete " + _configFile ) ;
			
			try 
			{
				// convert text to xml
				_xml = new XML(event.target.data);
				
				// dispatch event
				_cmEvent = new ConfigManagerEvent(ConfigManagerEvent.COMPLETE);
				_cmEvent.data = _xml;
				dispatchEvent(_cmEvent);
				
				_initialized = true ;
				
			}
			catch(e:TypeError) 
			{
				Alert.show("Error converting string to xml","XML Conversion error");
			}
		}
		
		public function getValue(val:String):String 
		{
			return _xml[val];
		}

		public function get isInitialized():Boolean { return _initialized ; }
	}
}