package com.momentumsi.c9.components.utils
{
	public class Assert
	{
		public static function isTrue( expression:Boolean, message:String="" ):void
		{
			config::DEBUG
			{
				if( ! expression )
				{
					throw new IllegalArgumentError
					(
						"Assertion failed " + message + new Error().getStackTrace()
					);
				}
			}
		}
	}
}