class Builders::Abc < SiteBuilder
  def build
    Dir['src/_songs/*.abc'].each do |song|
      content = File.read(song)
      title = content.match(/T:(.*)/)[1]
      add_resource :songs, "#{title.downcase.gsub(" ","_")}.md" do
        title title
        layout :abc
        content "<pre>\n#{content}\n</pre>\n"
      end
    end
  end
end
