class DashboardApp < AppBase
  get '/' do
    #page = Nokogiri::HTML(open("http://www.transcendcomputing.com/news-events/"))
    #@news_events = page.css("div").select{|a| a['class'] == 'entry'}[0] 
    erb :"/dashboard/index"
  end
  
end
