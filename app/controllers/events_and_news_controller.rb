class EventsAndNewsController < ApplicationController

  # GET /events_and_news
  # GET /events_and_news.xml
  def index
    
    ## Setup initial 'topstack' cloud here, because this is first app call
    query = $client.cloud_query
    clouds = query.clouds
    clouds.each do |cloud|
       case cloud.cloud_provider
       when "Transcend"
            @transcend = cloud
       when "Eucalyptus"
            @eucalyptus = cloud
       when "OpenStack"
            @openstack = cloud
       when "HP"
            @hp = cloud
       end
    end
    
    if !@transcend.nil?
        ::Rails.logger.info("SETUP INFO ============> Beginning initial cloud setup..")
        require "#{Rails.root}/helpers/helpers.rb"
        begin
            file = @file || "/var/lib/tomcat6/conf/transcend.properties"
            properties = load_properties(file)
            ::Rails.logger.info("SETUP INFO ============> transcend.properties file loaded")
            if !properties["cloud.type"].nil? && properties["cloud.type"].match(/{/).nil?
                ::Rails.logger.info("SETUP INFO ============>#{properties["cloud.type"].downcase} cloud has been determined")
                case properties["cloud.type"].downcase
                when "eucalyptus"
                    @eucalyptus.topstack_enabled = true
                    @eucalyptus.topstack_id = properties["availability.zone"]
                    uri = URI.parse(properties["cloud.ec2.url"])
                    @eucalyptus.protocol = uri.scheme
                    @eucalyptus.host = uri.host
                    @eucalyptus.port = uri.port
                    @new_cloud = @eucalyptus
                    $client.cloud_update(@eucalyptus)
                    
                    # Remove default services from clouds not setup from install
                    @openstack.cloud_services.each do |s|
                        $client.remove_cloud_service(@openstack.id, s.id)
                    end 
                    
                    @hp.cloud_services.each do |s|
                        $client.remove_cloud_service(@hp.id, s.id)
                    end 
                    
                    ::Rails.logger.info("SETUP INFO ============>#{properties["cloud.type"].downcase} cloud has been set")
                    
                when "openstack","hp"
                    if properties["cloud.type"].downcase == "hp"
                        @user_cloud = @hp
                    elsif properties["cloud.type"].downcase == "openstack"
                        @user_cloud = @openstack
                    end
                    @user_cloud.topstack_enabled = true
                    @user_cloud.topstack_id = properties["availability.zone"]
                    @user_cloud.url = properties["cloud.openstack.token.api.url"]
                    @new_cloud = @user_cloud
                    $client.cloud_update(@user_cloud)
                    @eucalyptus.cloud_services.each do |s|
                        $client.remove_cloud_service(@eucalyptus.id, s.id)
                    end     

                    ::Rails.logger.info("SETUP INFO ============>#{properties["cloud.type"].downcase} cloud has been set")
                end
                
                if !properties["cloud.ec2.url"].nil?
                    if properties["cloud.ec2.url"].match(/{/).nil?
                        ec2_uri = URI.parse(properties["cloud.ec2.url"])
                        @new_cloud.cloud_services.each do |svc|
                            if svc.service_type == "EC2"
                                $client.remove_cloud_service(@new_cloud.id, svc.id)
                                break
                            end
                        end
                        compute_service = StackPlace::CloudService.new
                        compute_service.service_type = "EC2"
                        compute_service.protocol = ec2_uri.scheme
                        compute_service.host = ec2_uri.host
                        compute_service.path = ec2_uri.path
                        compute_service.port = ec2_uri.port
                        compute_service.enabled = true
                        $client.add_cloud_service(@new_cloud.id, compute_service)
                        ::Rails.logger.info("SETUP INFO ============> ec2 service has been set")
                    end
                end
                
                if !properties["cloud.s3.url"].nil?
                    if properties["cloud.s3.url"].match(/{/).nil?
                        s3_uri = URI.parse(properties["cloud.s3.url"])
                        @new_cloud.cloud_services.each do |svc|
                            if svc.service_type == "S3"
                                $client.remove_cloud_service(@new_cloud.id, svc.id)
                                break
                            end
                        end
                        storage_service = StackPlace::CloudService.new
                        storage_service.service_type = "S3"
                        storage_service.protocol = s3_uri.scheme
                        storage_service.host = s3_uri.host
                        storage_service.path = s3_uri.path
                        storage_service.port = s3_uri.port
                        storage_service.enabled = true
                        $client.add_cloud_service(@new_cloud.id, storage_service)
                        ::Rails.logger.info("SETUP INFO ============> s3 service has been set")
                    end
                end
                
                if !properties["cloud.iam.url"].nil?
                    if properties["cloud.iam.url"].match(/{/).nil?
                        iam_uri = URI.parse(properties["cloud.iam.url"])
                        identity_service = StackPlace::CloudService.new
                        identity_service.service_type = "iam"
                        identity_service.protocol = iam_uri.scheme
                        identity_service.host = iam_uri.host
                        identity_service.path = iam_uri.path
                        identity_service.port = iam_uri.port
                        identity_service.enabled = true
                        $client.add_cloud_service(@new_cloud.id, identity_service)
                        ::Rails.logger.info("SETUP INFO ============> iam service has been set")
                    end
                end
                
                $client.cloud_delete(@transcend.id)
                ::Rails.logger.info("SETUP INFO ============> place holder cloud has been removed")
            end
        rescue Errno::ENOENT => @error
            ::Rails.logger.error("============> transcend.properties file not found")
        end
    end
  
    begin
	    page = Nokogiri::HTML(open("http://www.transcendcomputing.com/news-events/"))
	    news_events = page.css("div").select{|a| a['class'] == 'entry'}[0]
	    File.open("#{Rails.root}/public/news_events.html", "w"){|f| f.write(news_events.to_html)}
    rescue
	    # Do not update file, because error occured
    end
    render :nothing => true
  end

  # GET /events/get_latest?take=5
  # Remember to add :format in the route to support this '/events_and_news/get_latest.:format'
  def get_latest
    top = params[:take] || 6

    @events_and_news = EventsAndNews.order("posted DESC").limit(top)

    # add the view
    respond_to do |format|
      format.html # get_latest.html.erb
      format.xml  { render :xml => @events_and_news, :camelize => true }
    end
  end


  # GET /events_and_news/1
  # GET /events_and_news/1.xml
  def show
    query = $client.news_event_query
    query.news_events.each do |event|
	    if event.id == params[:id]
		    @events_and_news = event
		    break
	    end
    end

    respond_to do |format|
      format.html # show.html.erb
    end
  end

  # GET /events_and_news/new
  # GET /events_and_news/new.xml
  def new
    @events_and_news = StackPlace::NewsEvent.new

    respond_to do |format|
      format.html # new.html.erb
    end
  end

  # GET /events_and_news/1/edit
  def edit
    query = $client.news_event_query
    query.news_events.each do |event|
	    if event.id == params[:id]
		    @events_and_news = event
		    break
	    end
    end
  end

  # POST /events_and_news
  # POST /events_and_news.xml
  def create
    @events_and_news = StackPlace::NewsEvent.new
    new_event = params[:news_event]
    @events_and_news.description = new_event["description"]
    @events_and_news.url = new_event["url"]
    @events_and_news.source = new_event["source"]
    @events_and_news.posted = "#{new_event["posted(1i)"]}-#{new_event["posted(2i)"]}-#{new_event["posted(3i)"]}"

    respond_to do |format|
      if $client.news_event_create(@events_and_news)
        format.html { redirect_to(events_and_news_index_url) }
      else
        render :action => "new"
        #format.xml  { render :xml => @events_and_news.errors, :status => :unprocessable_entity, :camelize => true }
      end
    end
  end

  # PUT /events_and_news/1
  # PUT /events_and_news/1.xml
  def update
    query = $client.news_event_query
    query.news_events.each do |event|
	    if event.id == params[:id]
		    @events_and_news = event
		    break
	    end
    end

    respond_to do |format|
      if $client.news_event_update(params[:events_and_news])
        redirect_to :action => 'show', :id => params[:id]
      else
        render :action => "edit"
      end
    end
  end

  # DELETE /events_and_news/1
  # DELETE /events_and_news/1.xml
  def delete
    query = $client.news_event_query
    query.news_events.each do |event|
	    if event.id == params[:id]
		    @events_and_news = event
		    break
	    end
    end	  
    $client.news_event_delete(@events_and_news.id)

    respond_to do |format|
      format.html { redirect_to(events_and_news_index_url) }
      format.xml  { head :ok }
    end
  end
end
