package com.momentumsi.c9.events
{
    import com.momentumsi.c9.models.User;
    
    import flash.events.Event;

    public class AccountCreateEvent extends Event
    {
        public static const ACCOUNT_CREATE:String = "accountCreate";
        public var user:User;
        public function AccountCreateEvent(user:Object)
        {
            super(ACCOUNT_CREATE, true);
            this.user = User.buildUser(user["account"]);
        }
    }
}