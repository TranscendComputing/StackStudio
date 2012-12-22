class ExternalLoggerController < ApplicationController
  def log_external_message
    @@flex_logger ||= Logger.new("#{Rails.root}/log/flex_log.log")
    @@flex_logger.info(params[:message])
    render :text => "logged"
  end

   def test_logger
       render :text => "logged"
   end
end

