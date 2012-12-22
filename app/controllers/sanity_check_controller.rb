class SanityCheckController < ApplicationController
   def check_alive
       @events = EventsAndNews.all
       if @events.length == 0
              render :text => "Application alive; database not seeded."
       else
              render :text => "Application alive"
       end
   end
end
