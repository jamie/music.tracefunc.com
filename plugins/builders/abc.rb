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

        content(content.split(/(?=X:)/).map{|content_block|
          id = content_block.match(/X:(.*)/)[1]
          <<~ABC
            <div class="tune" id="tune#{id}">
              <div class="audio" id="tune#{id}-audio"></div>
              <div class="paper" id="tune#{id}-paper">
              <pre>
              #{content_block}
              </pre>
              </div>
            </div>
          ABC
        }.join("<hr/>\n"))
      end
    end
  end
end
