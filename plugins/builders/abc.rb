class Builders::Abc < SiteBuilder
  def build
    Dir['src/_songs/*.abc'].each do |song|
      content = File.read(song)
      match = content.match(/T:(.*)/)
      next unless match
      title = match[1]
      filename = title.downcase.gsub(/[^a-zA-Z0-9]+/, "_")

      add_resource :songs, "#{filename}.md" do
        title title
        layout :abc
        permalink "/#{filename}.html"
        content "<pre>\n#{content}\n</pre>\n"
      end
    end
  end
end
