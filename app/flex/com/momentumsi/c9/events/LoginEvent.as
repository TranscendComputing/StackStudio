package com.momentumsi.c9.events
{
    import com.momentumsi.c9.models.User;
    
    import flash.events.Event;
    
    public class LoginEvent extends Event
    {
        public static const LOGIN:String = "login";
        public var user:User;
        public function LoginEvent(user:Object)
        {
            super(LOGIN, true);
			if(user is User)
			{
				this.user = user as User;
			}else
			{
				this.user = User.buildUser(user["account"]);
			}
        }
    }
}