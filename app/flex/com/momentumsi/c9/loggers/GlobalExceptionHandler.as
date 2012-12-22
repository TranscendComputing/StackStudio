package com.momentumsi.c9.loggers
{
    import flash.display.LoaderInfo;
    import flash.events.UncaughtErrorEvent;
    
    import mx.managers.ISystemManager;

    [Mixin]
    [DefaultProperty("handlerActions")]
    public class GlobalExceptionHandler
    {
        private static var loaderInfo:LoaderInfo;

        [ArrayElementType("com.momentumsi.c9.loggers.GlobalExceptionHandlerAction")]
        public var handlerActions:Array;

        public var preventDefault:Boolean;

        public static function init(sm:ISystemManager):void
        {
            loaderInfo = sm.loaderInfo;
        }

        public function GlobalExceptionHandler()
        {
            loaderInfo.uncaughtErrorEvents.addEventListener(UncaughtErrorEvent.UNCAUGHT_ERROR,
                                                            uncaughtErrorHandler);
        }

        private function uncaughtErrorHandler(event:UncaughtErrorEvent):void
        {
            for each (var action:GlobalExceptionHandlerAction in handlerActions)
            {
                action.handle(event.error);
            }

            if (preventDefault == true)
            {
                event.preventDefault();
            }
        }
    }
}