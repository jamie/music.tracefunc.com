class Builders::Abc < SiteBuilder
  def build
    Dir['src/_songs/*.abc'].each do |song|
      content = File.read(song)

      title = content.match(/^T:(.*)/)&.captures&.first&.gsub(/\(.*/, "")&.strip
      book = content.match(/^B:(.*)/)&.captures&.first&.strip
      next unless title || book
      page_name = book || title
      filename = page_name.downcase.gsub(/[^a-zA-Z0-9]+/, "_")

      add_resource :songs, "#{filename}.md" do
        title page_name
        layout :abc
        permalink "/#{filename}.html"

        content(content.split(/(?=X:)/).map{|content_block|
          id = content_block.match(/X:(.*)/)[1]
          <<~ABC
            <div class="tune" id="tune#{id}">
              <div class="paper" id="tune#{id}-paper">
                <pre>
                #{content_block}
                </pre>
              </div>
              <div class="audio abcjs-large" id="tune#{id}-audio"></div>
              <div class="paper-transpose" id="tune#{id}-paper-transpose"></div>
            </div>
          ABC
        }.join("<hr/>\n"))
      end
    end
  end
end
