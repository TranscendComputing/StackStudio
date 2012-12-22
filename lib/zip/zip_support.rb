module ZipSupport
  def build_download_zip(stack, zip_path_prefix=nil)
    zip=ZipBuilder.new
    stack.templates.each do |template|
      # fetch each template's raw JSON and save into the zip file
      json = client.template_raw(template.id)
      zip.add_content_to_zip(zip_path_prefix, "#{template.name.to_permalink}.json", json)
    end
    zip
  end

  def build_doc_zip(template, zip=ZipBuilder.new, zip_path_prefix=nil)
    # requires instance variables to be set before calling
    html = erb :"templates/doc", :layout=>false

    json = client.template_raw(template.id)
    zip.add_content_to_zip(zip_path_prefix, "#{template.name.to_permalink}.json", json)
    zip.add_content_to_zip(zip_path_prefix, 'index.html', html)
    zip.add_file_to_zip("#{zip_path_prefix}stylesheets", 'screen.css', File.join(File.dirname(__FILE__), '..', '..', 'public','stylesheets', 'screen.css'))
    zip.add_file_to_zip("#{zip_path_prefix}stylesheets", 'style.css', File.join(File.dirname(__FILE__), '..', '..', 'public','stylesheets', 'style.css'))
    zip.add_file_to_zip("#{zip_path_prefix}javascripts", 'jeesh.min.js', File.join(File.dirname(__FILE__), '..', '..', 'public','javascripts', 'jeesh.min.js'))
    zip.add_file_to_zip("#{zip_path_prefix}javascripts", 'jquery-1.7.1.min.js', File.join(File.dirname(__FILE__), '..', '..', 'public','javascripts', 'jquery-1.7.1.min.js'))
    zip.add_file_to_zip("#{zip_path_prefix}javascripts", 'jquery-ui-1.8.17.custom.min.js', File.join(File.dirname(__FILE__), '..', '..', 'public','javascripts', 'jquery-ui-1.8.17.custom.min.js'))
    zip.add_file_to_zip("#{zip_path_prefix}javascripts", 'modernizr-2.0.js', File.join(File.dirname(__FILE__), '..', '..', 'public','javascripts', 'modernizr-2.0.js'))
    zip.add_file_to_zip("#{zip_path_prefix}javascripts", 'octopress.js', File.join(File.dirname(__FILE__), '..', '..', 'public','javascripts', 'octopress.js'))
    zip.add_file_to_zip("#{zip_path_prefix}javascripts", 'template_support.js', File.join(File.dirname(__FILE__), '..', '..', 'public','javascripts', 'template_support.js'))
    zip.add_file_to_zip("#{zip_path_prefix}images", 'logo-small.png', File.join(File.dirname(__FILE__), '..', '..', 'public','images', 'logo-small.png'))
    zip.add_file_to_zip("#{zip_path_prefix}images", 'icon_collapsed.png', File.join(File.dirname(__FILE__), '..', '..', 'public','images', 'icon_collapsed.png'))
    zip.add_file_to_zip("#{zip_path_prefix}images", 'icon_expanded.png', File.join(File.dirname(__FILE__), '..', '..', 'public','images', 'icon_expanded.png'))
    zip.add_file_to_zip("#{zip_path_prefix}images", 'noise.png', File.join(File.dirname(__FILE__), '..', '..', 'public','images', 'noise.png'))
    zip.add_file_to_zip("#{zip_path_prefix}images", 'BackgroundTile3.png', File.join(File.dirname(__FILE__), '..', '..', 'public','images', 'BackgroundTile3.png'))
    zip.add_file_to_zip("#{zip_path_prefix}images/buttons", 'ViewDoc_v2.png', File.join(File.dirname(__FILE__), '..', '..', 'public','images', 'buttons', 'ViewDoc_v2.png'))
    zip.add_file_to_zip("#{zip_path_prefix}images/buttons", 'ViewSource_v2.png', File.join(File.dirname(__FILE__), '..', '..', 'public','images', 'buttons', 'ViewSource_v2.png'))
    zip.add_file_to_zip("#{zip_path_prefix}images/buttons", 'Launch_v2.png', File.join(File.dirname(__FILE__), '..', '..', 'public','images', 'buttons', 'Launch_v2.png'))
    zip.add_file_to_zip("#{zip_path_prefix}images/buttons", 'Edit_v2.png', File.join(File.dirname(__FILE__), '..', '..', 'public','images', 'buttons', 'Edit_v2.png'))
    zip.add_file_to_zip("#{zip_path_prefix}images/icons", 'IAM_24.png', File.join(File.dirname(__FILE__), '..', '..', 'public','images', 'icons', 'IAM_24.png'))
    zip.add_file_to_zip("#{zip_path_prefix}images/icons", 'NewLB_24.png', File.join(File.dirname(__FILE__), '..', '..', 'public','images', 'icons', 'NewLB_24.png'))
    zip.add_file_to_zip("#{zip_path_prefix}images/icons", 'Autoscale_24.png', File.join(File.dirname(__FILE__), '..', '..', 'public','images', 'icons', 'Autoscale_24.png'))
    zip.add_file_to_zip("#{zip_path_prefix}images/icons", 'NewBasicServer_24.png', File.join(File.dirname(__FILE__), '..', '..', 'public','images', 'icons', 'NewBasicServer_24.png'))
    zip.add_file_to_zip("#{zip_path_prefix}images/icons", 'NewDB_24.png', File.join(File.dirname(__FILE__), '..', '..', 'public','images', 'icons', 'NewDB_24.png'))
    zip.add_file_to_zip("#{zip_path_prefix}images/icons", 'NotificationService_24.png', File.join(File.dirname(__FILE__), '..', '..', 'public','images', 'icons', 'NotificationService_24.png'))
    zip.add_file_to_zip("#{zip_path_prefix}images/icons", 'CloudWatch_24.png', File.join(File.dirname(__FILE__), '..', '..', 'public','images', 'icons', 'CloudWatch_24.png'))
    zip.add_file_to_zip("#{zip_path_prefix}images/icons", 'CFStack_24.png', File.join(File.dirname(__FILE__), '..', '..', 'public','images', 'icons', 'CFStack_24.png'))
    zip.add_file_to_zip("#{zip_path_prefix}images/icons", 'Internet.png', File.join(File.dirname(__FILE__), '..', '..', 'public','images', 'icons', 'Internet.png'))
    zip.add_file_to_zip("#{zip_path_prefix}images/vendor_icons", 'amazon_linux.png', File.join(File.dirname(__FILE__), '..', '..', 'public','images', 'vendor_icons', 'amazon_linux.png'))
    zip.add_file_to_zip("#{zip_path_prefix}images/vendor_icons", 'cent_os.gif', File.join(File.dirname(__FILE__), '..', '..', 'public','images', 'vendor_icons', 'cent_os.gif'))
    zip.add_file_to_zip("#{zip_path_prefix}images/vendor_icons", 'debian.gif', File.join(File.dirname(__FILE__), '..', '..', 'public','images', 'vendor_icons', 'debian.gif'))
    zip.add_file_to_zip("#{zip_path_prefix}images/vendor_icons", 'fedora.gif', File.join(File.dirname(__FILE__), '..', '..', 'public','images', 'vendor_icons', 'fedora.gif'))
    zip.add_file_to_zip("#{zip_path_prefix}images/vendor_icons", 'gentoo.gif', File.join(File.dirname(__FILE__), '..', '..', 'public','images', 'vendor_icons', 'gentoo.gif'))
    zip.add_file_to_zip("#{zip_path_prefix}images/vendor_icons", 'open_solaris.gif', File.join(File.dirname(__FILE__), '..', '..', 'public','images', 'vendor_icons', 'open_solaris.gif'))
    zip.add_file_to_zip("#{zip_path_prefix}images/vendor_icons", 'open_suse.gif', File.join(File.dirname(__FILE__), '..', '..', 'public','images', 'vendor_icons', 'open_suse.gif'))
    zip.add_file_to_zip("#{zip_path_prefix}images/vendor_icons", 'red_hat.gif', File.join(File.dirname(__FILE__), '..', '..', 'public','images', 'vendor_icons', 'red_hat.gif'))
    zip.add_file_to_zip("#{zip_path_prefix}images/vendor_icons", 'suse_linux.png', File.join(File.dirname(__FILE__), '..', '..', 'public','images', 'vendor_icons', 'suse_linux.png'))
    zip.add_file_to_zip("#{zip_path_prefix}images/vendor_icons", 'ubuntu.png', File.join(File.dirname(__FILE__), '..', '..', 'public','images', 'vendor_icons', 'ubuntu.png'))
    zip.add_file_to_zip("#{zip_path_prefix}images/vendor_icons", 'windows.png', File.join(File.dirname(__FILE__), '..', '..', 'public','images', 'vendor_icons', 'windows.png'))
    zip
  end
end
