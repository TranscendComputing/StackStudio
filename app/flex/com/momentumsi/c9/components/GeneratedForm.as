package com.momentumsi.c9.components
{
	import com.momentumsi.c9.utils.Helpers;
	
	import flash.events.Event;
	
	import mx.collections.ArrayCollection;
	import mx.containers.FormItem;
	import mx.controls.Text;
	import mx.core.UIComponent;
	import mx.events.CollectionEvent;
	import mx.events.CollectionEventKind;
	import mx.styles.CSSStyleDeclaration;
	
	import spark.components.Form;
	import spark.components.FormHeading;
	import spark.components.TextInput;
	import spark.layouts.FormLayout;
	import spark.skins.spark.FormItemSkin;
	import spark.skins.spark.FormSkin;
	
	public class GeneratedForm extends Form
	{
		private var collection:ArrayCollection;
		private var _isEditable:Boolean = false;
		
		public function GeneratedForm()
		{
			super();
			//var formLayout:FormLayout = new FormLayout();
			//super.layout = formLayout;
		}
		
		//----------------------------------
		//  dataProvider
		//----------------------------------
		
		
		[Bindable("collectionChange")]
		[Inspectable(category="Data")]
		public function get dataProvider():Object
		{
			return collection;
		}
		
		public function set dataProvider(value:Object):void
		{
			//Check for form heading
			var formHeading:FormHeading;
			if(super.getElementAt(0) is FormHeading)
			{
				formHeading = super.getElementAt(0) as FormHeading
			}
			
			//Reset form
			super.removeAllElements();
			
			//If form heading was found, add it back
			if(formHeading != null)
			{
				super.addElement(formHeading);
			}
			
			var formItem:FormItem;
			var propertyValueComponent:UIComponent;
			for(var p:* in value)
			{
				formItem = new FormItem();
				formItem.percentWidth = 100;
				formItem.setStyle("fontWeight", "bold");
				formItem.setStyle("textAlign", "right");
				formItem.label = Helpers.camelize(String(p)) + ":";
				if(editable)
				{
					propertyValueComponent = new TextInput();
					(propertyValueComponent as TextInput).text = value[p];
				}else{
					propertyValueComponent = new Text();
					(propertyValueComponent as Text).text = value[p];
					
				}
				propertyValueComponent.setStyle("fontWeight", "normal");
				propertyValueComponent.setStyle("textAlign", "left");
				propertyValueComponent.percentWidth = 100;
				formItem.addElement(propertyValueComponent);
				super.addElement(formItem);
			}
			
			var tmp:Array = [value];
			collection = new ArrayCollection(tmp);
			collection.addEventListener(CollectionEvent.COLLECTION_CHANGE, collectionChangeHandler, false, 0, true);
			
			var event:CollectionEvent = new CollectionEvent(CollectionEvent.COLLECTION_CHANGE);
			event.kind = CollectionEventKind.RESET;
			collectionChangeHandler(event);
			dispatchEvent(event);
		}
		
		//----------------------------------
		//  editable
		//----------------------------------
		
		[Inspectable(category="General", defaultValue="true")]
		
		/**
		 *  Specifies whether the text is editable.
		 */
		public function get editable():Boolean
		{
			// want the default to be true
			var v:* = _isEditable;
			return (v === undefined) ? true : v;
		}
		
		/**
		 *  @private
		 */
		public function set editable(value:Boolean):void
		{
			_isEditable = value;                  
		}
		
		//----------------------------------
		//  event handlers
		//----------------------------------
		
		protected function collectionChangeHandler(event:Event):void
		{
			//TODO
		}
	}
}