class UserMailer < ActionMailer::Base
  default :from => "support@transcendcomputing.com"
  @@bcc_group = "cstewart@momentumsi.com, bjones@momentumsi.com, dkim@momentumsi.com, jschneider@momentumsi.com, thite@momentumsi.com, rarora@momentumsi.com"

  def welcome(user)
    @user = user
    @subject = "Welcome to StackStudio"
    @sent_on = Time.now
    data = File.read(Rails.root.join('public/images/TranscendLogoVerySmall.png'))
    attachments.inline['TranscendLogoVerySmall.png'] = data
    mail(:to => @user.email, :bcc => [@@bcc_group], :subject => @subject) do |format|
      format.html
      format.text
    end
  end

  def new_subscriber(organization, recipient)
    @subject = "New StackStudio Subscriber"
    @org = organization
    mail(:to => recipient, :bcc => [@@bcc_group], :subject => @subject) do |format|
      format.text
    end
  end

  def new_account_subscriber(user, organization)
    @org = organization
    @user = user
    @subject = "Welcome to StackStudio"
    @sent_on = Time.now
    mail(:to => @user.email, :bcc => [@@bcc_group], :subject => @subject) do |format|
      format.text
    end
  end

  def new_subscription_receipt(recipient, subscription_receipt)
    @subject = "StackStudio Subscription Receipt"
    @receipt = subscription_receipt
    mail(:to => recipient, :bcc => [@@bcc_group], :subject => @subject) do |format|
      format.text
    end
  end

end

