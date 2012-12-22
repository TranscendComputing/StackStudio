class ReportMailer < ActionMailer::Base
	default :from => "support@transcendcomputing.com"
      	@@cc_group = "cstewart@momentumsi.com"
    	require Rails.root.to_s + "/helpers/helpers.rb"

  def report
    @subject = "StackStudio Report"
    @sent_on = Time.now
    @date = Time.now
    get_report
    #data = File.read(Rails.root.join('report.txt'))
    #attachments.inline['report.txt'] = data
    mail(:to => @cc_group, :cc => [@@cc_group], :subject => @subject) do |format|
      format.text
    end
  end

end

