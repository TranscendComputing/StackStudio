package com.momentumsi.c9.utils
{
	import mx.controls.LinkButton;
	import flash.text.TextLineMetrics;
	
	public class MultiLineLinkButton extends LinkButton {
		override protected function createChildren():void {
			super.createChildren();
			if (textField){
				textField.wordWrap = true;
				textField.multiline = true;
			}
		}
		
		override public function measureText(s:String):TextLineMetrics {
			textField.text = s;
			var lineMetrics:TextLineMetrics = textField.getLineMetrics(0);
			lineMetrics.width = textField.width;
			//lineMetrics.width = width;
			lineMetrics.height = textField.textHeight;
			/*
			lineMetrics.height = (textField.textHeight>50)
				? 50
				: textField.textHeight;
			*/
			return lineMetrics;
		}
	}
}