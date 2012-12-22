# This controller handles the login/logout function of the site.
class SessionsController < ApplicationController

  ####################################
  ## Switch to StackPlace API Login ##
  ####################################
  
  	def account_login
		@user = User.find_by_stackplace_user_id(params[:account_id])
  		if @user.nil?
  			self.current_user = User.create({:stackplace_user_id => params[:account_id]})
  		else
  			self.current_user = @user
  		end		
  		render :xml => self.current_user.to_xml
  	end
  
  ####################################
  ## End of StackPlace API Methods ###
  ####################################



  # render new.rhtml
  def new
  end

  # Once we explain REST in the book this will obviously be
  # refactored.
  def create_xml
    self.current_user = User.authenticate(params[:login], params[:password])
    if logged_in?
      if params[:remember_me] == "1"
        self.current_user.remember_me
        cookies[:auth_token] = {
          :value => self.current_user.remember_token,
          :expires => self.current_user.remember_token_expires_at
        }
      end
      render :xml => self.current_user.to_xml
    else
      render :text => "badlogin"
    end
  end

  def create
    self.current_user = User.authenticate(params[:login], params[:password])
    if logged_in?
      if params[:remember_me] == "1"
        current_user.remember_me unless current_user.remember_token?
        cookies[:auth_token] = { :value => self.current_user.remember_token , :expires => self.current_user.remember_token_expires_at }
      end
      redirect_back_or_default('/')
      flash[:notice] = "Logged in successfully"
    else
      render :action => 'new'
    end
  end

  def destroy
    self.current_user.forget_me if logged_in?
    cookies.delete :auth_token
    reset_session
    flash[:notice] = "You have been logged out."
    #redirect_back_or_default('/')
    render :nothing => true
  end
end

