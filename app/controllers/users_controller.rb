class UsersController < ApplicationController

	def email_user
		@new_account = $client.identity_details(params[:user_id])
		UserMailer.welcome(@new_account).deliver
		render :nothing => true
	end

  ##############################
  ## Switch To StackPlace API ##
  ##############################

 	def check_unique_login
		@client = StackPlace::HttpClient.connection.account_details(params[:login])
 		render :text => "not_unique"
 	    rescue
 		render :text => "unique"
 	end

 	def get_countries_list
 		@client = StackPlace::HttpClient.new

 		render :json => @client.country_query
 	end

 	def create_new_account
    	@stackweb_client = StackPlace::HttpClient.new

          set_account_information

          create_user_in_stackplace

          if !@new_acct_details[:new_subscription].nil?
              if create_new_subscription == false
                  return
              end
          end

      UserMailer.welcome(@new_account).deliver
      #ses = getSesInterface
      #@ses.send_email(:subject => "Welcome to StackStudio", :from => 'cstewart@transcendcomputing.com', :to => @user_account[:email], :body_text => 'Thank you for choosing StackStudio.')
      render :json => @user.to_json
 	end

 	def set_account_information
      @new_acct_details = params[:account_details]
      @new_subscription_info = @new_acct_details[:new_subscription] unless @new_acct_details[:new_subscription].nil?
      @customer_info = @new_acct_details[:customer] unless @new_acct_details[:customer].nil?
      @user_account =  @new_acct_details[:user_account][:account]
  end

 	def create_user_in_stackplace
   	  @new_account = ::StackPlace::Account.new

      # Create new account in stackplace
      #
   		@new_account.login = @user_account[:login]
   		@new_account.email = @user_account[:email]
   		@new_account.first_name = @user_account[:first_name]
   		@new_account.last_name = @user_account[:last_name]
   		@new_account.password = @user_account[:password]
   		@new_account.password_confirmation = @user_account[:password]
   		@new_account.country_code = @user_account[:country]
   		@new_account.company = @user_account[:company]

   		@account_details = @stackweb_client.identity_create(@new_account)
   		#
   		# Finish creating account in stackplace

   		@user = User.create({:stackplace_user_id => @account_details.id})
	end

	def add_subscribers
 	    @stackweb_client = StackPlace::HttpClient.new
      #ses = getSesInterface

	    subscribers_info = JSON.parse(params["subscriber_info"])
	    @org_details = @stackweb_client.org_details(subscribers_info["org_id"])
	    current_user_details = @stackweb_client.identity_details(current_user.stackplace_user_id)

	    invalid_emails = []
	    @user_accounts = subscribers_info["user_accounts"]
	    @user_accounts.each do |user_info|
	       begin
	           @user_account = user_info
	           @account_details = @stackweb_client.account_details(@user_account["email"])
	           UserMailer.new_subscriber(@org_details.name, @user_account["email"]).deliver
         rescue StackPlace::NotFound => error
      	     @user_account[:email] = @user_account["email"]
             @user_account[:login] = @user_account["login"]
             @user_account[:password] = "transcend"
             @user_account[:country] = "United States"
             @user_account[:company] = @org_details.name

             create_user_in_stackplace
             UserMailer.new_account_subscriber(@new_account, @org_details.name).deliver
	       end
	           @user = User.find_by_stackplace_user_id(@account_details.id)
             if @user.nil?
                @user = User.create({:stackplace_user_id => @account_details.id})
             end

             # Add  user as basic to subscription
             if @user_account["admin"] == "true"
               role = "admin"
             else
               role = "basic"
             end
             @stackweb_client.add_subscriber(@org_details.id, "stack_studio", @account_details.id, role)
      end
      render :text => "Users have been subscribed and will receive notifications shortly."
  end


  def create_new_subscription
      @customer_info["reference"] = @account_details.id
      chargify_customer = Chargify::Customer.create(@customer_info)
      chargify_customer.save
      if !@new_subscription_info[:seats].nil?
          components = [{:component_id => 9102, :allocated_quantity => @new_subscription_info[:seats]}]
      else
          components = nil
      end

      new_subscription_details = {}
      new_subscription_details[:customer_id] = chargify_customer.id
      new_subscription_details[:customer_reference] = @account_details.id
      new_subscription_details[:product_handle] = 'pro'
      new_subscription_details[:credit_card_attributes] = @new_subscription_info[:billing_info]
      new_subscription_details[:components] = components unless components.nil?
      chargify_subscription = Chargify::Subscription.create(new_subscription_details)

          ## Test that subscription was created
      if chargify_subscription.errors != {}
          error = {}
          error[:error_message] = chargify_subscription.errors.full_messages.inspect
          render :json => error.to_json
          return false
      else
          # Create new organization in stackplace
          #
          org = StackPlace::Org.new
          org.name = @customer_info["organization"]
          org_details = @stackweb_client.org_create(org)
          #
          # Finish creating org in stackplace

          # Create new subscription for org in stackplace
          #
          subscription = StackPlace::Subscription.new
          subscription.billing_level = chargify_subscription.product.handle
          subscription.billing_customer_id = chargify_subscription.customer.id
          subscription.billing_subscription_id = chargify_subscription.id

          updated_subs = @stackweb_client.update_subscription(org_details.id, "stack_studio", subscription)
          #
          # Finish updating org subscription

          # Add new user as admin to subscription
          @stackweb_client.add_subscriber(org_details.id, "stack_studio", @account_details.id, "admin")

          # Email customer their receipt
          UserMailer.new_subscription_receipt(@customer_info["email"], chargify_subscription.statements[0].attributes["text_view"]).deliver

      end
  end

  def update_subscription
    @stackweb_client = StackPlace::HttpClient.new
    @account_details = @stackweb_client.identity_details(current_user.stackplace_user_id)
    set_account_information
    if @new_subscription_info["action"] == "update"
      # TODO
    else
      create_new_subscription
    end
    render :text => "success"
  end


  def get_identity_subscriptions
    @stackweb_client = StackPlace::HttpClient.new

    identity = @stackweb_client.identity_details(current_user.stackplace_user_id)
    admin_subscriptions = []
    subscribed_to = []
    identity.subscriptions.each do |subscription|
        subscription_details = {}
        subscription_details[:subscription] = subscription
        if subscription.role == "admin"
            org = @stackweb_client.org_details(subscription.org_id)
            org_subscription = org.subscriptions[0]
            subscription_details[:subscribers] = []
            org_subscription.subscribers.each do |subscriber|
                if subscriber.account.id != current_user.stackplace_user_id
                    subscription_details[:subscribers] << @stackweb_client.identity_details(subscriber.account.id).email
                end
            end
        begin
            subscription_details[:allocated_seats] = Chargify::Subscription.find(org_subscription.billing_subscription_id).components[0].attributes["allocated_quantity"]
        rescue ActiveResource::ResourceNotFound => error
        end
            admin_subscriptions << subscription_details
        else
            subscribed_to << subscription_details
        end
    end

    return_object = {}
    return_object[:identity] = identity
    return_object[:num_projects] = current_user.projects.length
    return_object[:subscribed_to] = subscribed_to
    return_object[:subscriptions] = admin_subscriptions
    render :json => return_object
  end



  ###########################
  ## End of StackPlace API ##
  ###########################

  # render new.rhtml
  def new
  end

  # Once we explain REST in the book this will obviously be
  # refactored.
  def create_xml
    @user = User.new(params[:user])
    @user.save!
=begin
    respond_to do |format|
      if @user.save!
	UserMailer.welcome_email(@user).deliver
      end
    end
=end
    self.current_user = @user
    render :xml => @user.to_xml
  rescue ActiveRecord::RecordInvalid
    render :text => "error"
  end

  def create_user_for_project
    @user = User.new(params[:user])
    if @user.save
      render :xml => @user
    else
      render :text => "error"
    end
  end


  def create
    cookies.delete :auth_token
    # protects against session fixation attacks, wreaks havoc with
    # request forgery protection.
    # uncomment at your own risk
    # reset_session
    @user = User.new(params[:user])
    @user.save
    if @user.errors.empty?
      self.current_user = @user
      redirect_back_or_default('/')
      flash[:notice] = "Thanks for signing up!"
    else
      render :action => 'new'
    end
  end

  # GET /user/accounts.xml
  def get_user_accounts
    render :xml => self.current_user.ec2_accounts.to_xml
  rescue ActiveRecord::RecordInvalid
    render :text => "error"
  end

  # GET /user/projects
  # GET /user/projects.xml
  def get_user_projects
    render :xml => self.current_user.projects.to_xml
  rescue ActiveRecord::RecordInvalid
    render :text => "error"
  end

  # GET /user/other_users
  def get_other_users
   render :xml => User.where("id != ?", self.current_user.id).to_xml
  end

  # GET /user/get_available_projects
  def get_available_projects
    #project_ids = []
    #UserProjectRel.where(:user_id => self.current_user.id).each do |t|
    #   project_ids.push(t.project_id)
    #end
    render :xml => UserProjectRel.find_all_by_user_id(current_user.id, :include => [:project]).collect{|user_project_rel| user_project_rel.project}
  rescue ActiveRecord::RecordInvalid
    render :text => "error"
  end

  # POST /user/create_project
  # POST /user/create_project.xml
  def create_user_project
    new_title = params[:project_title]
    render :xml => self.current_user.projects.create(:project_title => new_title.to_s, :description => params[:description], :ec2_account_id => params[:ec2_account_id], :owner_id => self.current_user.id)
  rescue ActiveRecord::RecordInvalid
    render :text => "error"
  end

  # POST /user/create_user_account.xml
  def create_user_account
    self.current_user.ec2_accounts.create(:account_name => params[:account_name], :access_key_id => params[:key], :secret_access_key => params[:secret], :cloud_id => params[:cloud_id])
    render :xml => self.current_user.ec2_accounts.find(:last)
  rescue ActiveRecord::RecordInvalid
    render :text => "error"
  end

  # POST /user/set_open_project
  # POST /user/set_open_project.xml
  def set_open_project
    self.current_user.open_project_id = params[:open_project_id]
    session[:revision] = params[:revision]
    render :xml => self.current_user.projects.find(self.current_user.open_project_id)
  rescue ActiveRecord::RecordInvalid
    render :text => "error"
  end

  # GET /user/get_open_project
  # GET /user/get_open_project.xml
  def get_open_project
    render :xml => self.current_user.open_project_id
  rescue ActiveRecord::RecordInvalid
    render :text => "error"
  end


  # POST /user/reset_password
  # POST /user/reset_password.xml
  def reset_password
   @user = User.where(:login => params[:login])
   UserMailer.reset_password(@user).deliver
   render :xml => @user
  end

  #GET /user/get_service_health
  def get_service_health
    render :xml => current_user.get_service_health(params)
  end

  def get_all_object_management_items
    @user = self.current_user
    render :xml => @user.get_all_object_management_items(params)
  end

  def get_orphan_items
    @user = self.current_user
    render :xml => @user.get_orphan_items(params)
  end

  def get_company_name
    @user = self.current_user
    render :xml => @user
  end
end

