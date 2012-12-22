package com.momentumsi.c9.utils
{
	import com.momentumsi.c9.components.BodyStack;
	import com.momentumsi.c9.components.MainBox;
	import com.momentumsi.c9.components.ObjectManagementTab;
	import com.momentumsi.c9.components.ProjectTab;
	import com.momentumsi.c9.components.WelcomeDashboard;
	import com.momentumsi.c9.models.Node;
	
	import flash.display.DisplayObject;
	import flash.display.DisplayObjectContainer;
	import flash.events.ErrorEvent;
	import flash.utils.Dictionary;
	
	import fr.kapit.diagrammer.Diagrammer;
	import fr.kapit.diagrammer.base.uicomponent.DiagramSprite;
	
	import mx.collections.ArrayCollection;
	import mx.containers.Box;
	import mx.containers.Canvas;
	import mx.containers.TabNavigator;
	import mx.controls.Alert;
	import mx.controls.ComboBase;
	import mx.controls.ComboBox;
	import mx.core.FlexGlobals;
	import mx.core.UIComponent;
	import mx.rpc.events.FaultEvent;
	import mx.rpc.events.ResultEvent;
	import mx.validators.Validator;
	
	import spark.components.NavigatorContent;
	import spark.components.supportClasses.SkinnableTextBase;
	
	public final class Helpers
	{
		//Test for empty text input field
		public static function isEmptyTextField(field:SkinnableTextBase):Boolean
		{
			if(field.text.replace(/\s/g, "") == ""){
				return true;
			}else{
				return false;
			}
		}
		
		public static function camelize(string:String):String
		{
			var a:ArrayCollection = new ArrayCollection(string.split("_"));
			var firstChar:String;
			var newString:String = "";
			for each(var s:String in a)
			{
				firstChar = s.charAt(0).toUpperCase();
				firstChar = firstChar + s.substring(1);
				newString = newString + firstChar + " ";
			}
			return newString;
		}
		
		
		// Given a ResultEvent with XML, return XMLList of child elements
		public static function xmlChildrenFromEvent(event:ResultEvent):XMLList
		{
			var result:Object = event.result;
			var xml:XML = new XML(result);
			return xml.children();				
		}
		
		public static function readOnlyMode(c:UIComponent):Boolean
		{
			return c.parentApplication.headerBox.readOnly;
		}
		
		public static function getNodeFromResourceName(diagram:Diagrammer, resourceName:String):DiagramSprite
		{
			var returnNode:DiagramSprite;
			for each(var node:DiagramSprite in diagram.nodesMap)
			{
				if(Node(node.data).name == resourceName)
				{
					returnNode = node;
					break
				}
			}
			return returnNode;
		}
		
		public static function relinkNodes(newNode:DiagramSprite, currentNode:DiagramSprite, c:UIComponent):void
		{
			var designDiagram:Diagrammer = c.parentApplication.bodyStack.mainBox.designView.vis;
			if(currentNode.outConnections != null || currentNode.inConnections != null)
			{
				var connection:DiagramSprite;
				for each(connection in currentNode.outConnections)
				{
					designDiagram.addLinkElement(null, newNode, connection);
				}
				for each(connection in currentNode.inConnections)
				{
					designDiagram.addLinkElement(null, newNode, connection);
				}
			}
		}
		
		public static function validateAlphanumeric(s:String):Boolean
		{
			var validation:Boolean = false;
			var validationPattern:RegExp = /^[A-Za-z0-9]+$/;
			if(validationPattern.test(s))
			{
				validation = true;
			}
			
			return validation;
		}
		
		public static function handleFault(event:FaultEvent):void
		{
			Alert.show('Connection error.  Please try again later, or contact the administrator if problems persist.  Sorry for the inconvenience.');
		}
		
		public static function currentAccount( c:UIComponent ) : int
		{
			return c.parentApplication.headerBox.accountId;
		}
		
		public static function currentProjectName(c:UIComponent):String
		{
			return c.parentApplication.headerBox.projectName;
		}
		
		public static function currentCloud ( c:UIComponent ) : String
		{
			return c.parentApplication.headerBox.cloud;
		}
		
		public static function currentProject(c:UIComponent):int
		{
			return c.parentApplication.headerBox.projectId;
		}
		
		public static function currentEnvironmentName ( c:UIComponent ) : String
		{
			return c.parentApplication.headerBox.currentEnvironmentName;
		}
		
		public static function currentEnvironment(c:UIComponent):int
		{
			return c.parentApplication.headerBox.currentEnvironmentId;
		}
		
		public static function getMainBox(c:UIComponent):MainBox
		{
			var bodyStack:BodyStack;
			try{
				bodyStack = c.parentApplication.bodyStack;
			}catch(e:Error){
				var parentApp:Object = c;
				bodyStack = parentApp.parentApplication.bodyStack;
			}
			var selectedGlobalTab:ProjectTab = bodyStack.globalTabs.selectedChild as ProjectTab;
			var mainBox:MainBox = selectedGlobalTab.workbenchSpace;				
			return mainBox;
		}
		
		public static function getObjectManagement(c:UIComponent):ObjectManagementTab
		{
			var bodyStack:BodyStack;
			try
			{
				bodyStack = c.parentApplication.bodyStack;
			}catch(e:Error)
			{
				var parentApp:Object = c;
				bodyStack = parentApp.parentApplication.bodyStack;
			}
			var objectManagement:ObjectManagementTab = bodyStack.objectManagement;
			return objectManagement;
		}
		
		public static function getWelcomeDashboard(c:UIComponent):WelcomeDashboard
		{
			var bodyStack:BodyStack;
			try
			{
				bodyStack = c.parentApplication.bodyStack;
			}catch(e:Error)
			{
				var parentApp:Object = c;
				bodyStack = parentApp.parentApplication.bodyStack;
			}
			var welcomeDashboard:WelcomeDashboard = bodyStack.welcomeDashboard;
			return welcomeDashboard;
		}
		
		// This function expects a date in typical XSD DateTime
		// format as seen in XML, YYYY-MM-DDTHH:MM:SSZ
		public static function stringToDate(xsdDateString:String, includeTime:Boolean):Date
		{
			var year:Number, month:Number, date:Number;
			var hour:Number=0, minute:Number=0, second:Number=0;
			var timezone:String;
			
			year = Number(xsdDateString.substr(0,4));
			month = Number(xsdDateString.substr(5,2));
			date = Number(xsdDateString.substr(8,2));
			
			if( includeTime )
			{
				hour = Number(xsdDateString.substr(11,2));
				minute = Number(xsdDateString.substr(14,2));
				second = Number(xsdDateString.substr(17,2));
			}
			
			timezone = xsdDateString.substr(19,1);
			
			return new Date(year,month,date,hour,minute,second);	
		}
		
		// Convert a string to a Boolean
		public static function toBoolean(s:String):Boolean
		{
			switch (s)
			{
				case "true" :
				case "1" :
				case "True" :
					return true ;
					
				case "false" :
				case "0" :
				case "False" :
					return false ;
					
				default:
					throw new Error("Invalid parameter in Helpers.toBoolean");	
			}
		}
		
		public static function isValid(validatorArr:Array):Boolean
		{
			var validatorErrorArray:Array = Validator.validateAll(validatorArr);
			var isValid:Boolean = validatorErrorArray.length == 0;
			return isValid;
		}
		
		public static function isValidNumber(numString:String):Boolean
		{
			var valid:Boolean = false;
			try
			{
				var numInt:int = parseInt(numString);
				if(numInt > 0)
				{
					valid = true;
				}else
				{
					valid = false;
				}
			}catch(e:Error)
			{
				valid = false;
			}
			return valid;
		}
		
		public static function getHost():String
		{
			var app:Object = FlexGlobals.topLevelApplication;
			return app.GetConfiguration( "serviceUrl" ) ;
		}
		
		public static function doMove( c:UIComponent ):void
		{
			var appW:Number=FlexGlobals.topLevelApplication.width;
			var appH:Number=FlexGlobals.topLevelApplication.height;
			if(c.x+c.width>appW)
			{
				c.x=appW-c.width;
			}
			if(c.x<0)
			{
				c.x=0;
			}
			if(c.y+c.height>appH)
			{
				c.y=appH-c.height;
			}
			if(c.y<0)
			{
				c.y=0;
			}
		}
		
		public static function formatDate(dateString:String):Date
		{
			var date:Date = new Date();
			if(dateString != null && dateString != "")
			{
				var matches:Array = dateString.match(/(\d\d\d\d)-(\d\d)-(\d\d)T(\d\d):(\d\d):(\d\d)Z/);
				if(matches == null)
				{
					matches = dateString.match(/(\d\d\d\d)-(\d\d)-(\d\d)T(\d\d):(\d\d):(\d\d).(\d\d\d)Z/);
				}
				if(matches != null && matches.length > 6)
				{
					date.setUTCFullYear(int(matches[1]), int(matches[2]) - 1, int(matches[3]));
					date.setUTCHours(int(matches[4]), int(matches[5]), int(matches[6]), 0);
				}
				return date;
			}else
			{
				return null;
			}			
		}
		
		public static function getDesignDiagram(c:UIComponent):Diagrammer
		{
			try{
				return getMainBox(c).designView.vis;
			}catch(error:Error)
			{
				trace(error.message);				
			}
			return null;
		}
		
		public static function getRunningDiagram(c:UIComponent):Diagrammer
		{
			try{
				return getMainBox(c).runningView.visual;
			}
			catch(error:Error){
				trace(error.message);
			}
			return null;
		}
		
		public static function linkByName(diagram:Diagrammer, source:String, target:String):void
		{
			var sourceNode:DiagramSprite;
			var targetNode:DiagramSprite;
			var nodeName:String;
			for each(var node:DiagramSprite in diagram.nodesMap)
			{
				nodeName = node.data.child('name').toString();
				if(nodeName == source)
				{
					sourceNode = node;
				}else if(nodeName == target)
				{
					targetNode = node;
				}
			}
			diagram.addLinkElement(null, sourceNode, targetNode);
		}
		
		public static function resultToArrayCollection(result:Object, classType:Class=null):ArrayCollection
		{
			var resultCollection:ArrayCollection = new ArrayCollection(result as Array);
			if(classType == null)
			{
				return resultCollection;
			}else{
				var typeCollection:ArrayCollection = new ArrayCollection();
				for each(var item:Object in resultCollection)
				{
					typeCollection.addItem(new classType(item));
				}
				return typeCollection;
			}
		}
		
		/*---------------------------------------------------------------------------------------------
		
		[AS3] traceDL
		=======================================================================================
		
		Copyright (c) 2009 Tomek 'Og2t' Augustyn
		
		e	tomek@blog2t.net
		w	http://play.blog2t.net
		
		Please retain this info when redistributed.
		
		VERSION HISTORY:
		v0.1	30/4/2009	Initial concept
		v0.2	1/5/2009	Added more params, filter and depth
		
		USAGE:
		
		// displays the whole display list of any displayObject 
		traceDL(displayObject);
		
		// displays all displayObjects matching "filterString"
		traceDL(displayObject, "filterString");
		
		// displays the display list of any displayObject up to the given depth
		traceDL(displayObject, depth);
		
		---------------------------------------------------------------------------------------------*/
		
		public static function traceDL(container:DisplayObjectContainer, options:* = undefined, indentString:String = "", depth:int = 0, childAt:int = 0):void
		{
			if (typeof options == "undefined") options = Number.POSITIVE_INFINITY;
			
			if (depth > options) return;
			
			const INDENT:String = "   ";
			var i:int = container.numChildren;
			
			while (i--)
			{
				var child:DisplayObject = container.getChildAt(i);
				var output:String = indentString + (childAt++) + ": " + child.name + " âž” " + child;
				
				// debug alpha/visible properties
				output += "\t\talpha: " + child.alpha.toFixed(2) + "/" + child.visible;
				
				// debug x and y position
				output += ", @: (" + child.x + ", " + child.y + ")";
				
				// debug transform properties
				output += ", w: " + child.width + "px (" + child.scaleX.toFixed(2) + ")";
				output += ", h: " + child.height + "px (" + child.scaleY.toFixed(2) + ")"; 
				output += ", r: " + child.rotation.toFixed(1) + "Â°";
				
				if (typeof options == "number") trace(output);
				else if (typeof options == "string" && output.match(new RegExp(options, "gi")).length != 0)
				{
					trace(output, "in", container.name, "âž”", container);
				}
				
				if (child is DisplayObjectContainer) traceDL(DisplayObjectContainer(child), options, indentString + INDENT, depth + 1);
			}
		}
		
		public static function StringReplaceAll( source:String, find:String, replacement:String ):String
		{
			return source.split( find ).join( replacement );
		}
		
		public static function resetArrayWithPossibleProperty(array:Array, property:String):Array
		{
			var newArray:Array = [];
			for(var index:int=0; index < array.length; index++)
			{
				if(array[index][property])
				{
					newArray.push(array[index].id);
				}else{
					newArray.push(array[index]);
				}
			}
			return newArray;
		}
		
		public static function disableTab(tabNavigator:TabNavigator, navigatorContent:NavigatorContent, enable:Boolean=false):void
		{
			var tabIndex:int = tabNavigator.getElementIndex(navigatorContent);
			var tabButton:mx.controls.Button = tabNavigator.getTabAt(tabIndex);
			
			tabButton.visible = enable;
			tabButton.includeInLayout = enable;
		}
		
	}
}