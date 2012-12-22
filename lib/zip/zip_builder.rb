class ZipBuilder
  def initialize
    @z = Zippy.new
  end

  # adds a content as a file into the given zipfile directory name. If nil, adds it to the root of the zip file
  def add_content_to_zip( dst_dir, f, content )
    if dst_dir.nil?
      @z["#{f}"] = content
    else
      @z["#{dst_dir}/#{f}"] = content
    end
  end

  # adds a file into the given zipfile directory name. If nil, adds it to the root of the zip file
  def add_file_to_zip( dst_dir, f, source_filename )
    if dst_dir.nil?
      @z["#{f}"] = File.open(source_filename)
    else
      @z["#{dst_dir}/#{f}"] = File.open(source_filename)
    end
  end

  def data
    @z.data
  end

  def filename
    @z.filename
  end

  def close
    @z.close
  end

end
