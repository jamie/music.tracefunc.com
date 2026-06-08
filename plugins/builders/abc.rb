class Builders::Abc < SiteBuilder
  def build
    Dir['src/_songs/**/*.abc'].each do |song|
      content = File.read(song)

      title = content.match(/^T:(.*)/)&.captures&.first&.gsub(/\(.*/, "")&.strip
      book = content.match(/^B:(.*)/)&.captures&.first&.strip.then { |text| "\"#{text}\"" unless text.blank? }
      next unless title || book
      page_name = book || title
      filename = page_name.downcase.gsub(/[^a-zA-Z0-9]+/, "_")
      folder = File.dirname(song).split("/").last
      folder = nil if folder == "_songs"

      add_resource :songs, "#{filename}.md" do
        title page_name
        layout :abc
        folder folder
        permalink ["", "songs", folder, "#{filename}.html"].compact.join("/")

        content(content.split(/(?=X:)/).map{|content_block|
          id = content_block.match(/X:(.*)/)[1].strip
          <<~ABC
            <div class="tune" id="tune#{id}">
              <div class="paper" id="tune#{id}-paper">
              </div>
            </div>
            <pre class="tune-source" id="tune#{id}-source">
            #{content_block}
            </pre>
          ABC
        }.join("<hr/>\n"))
      end
    end
  end
end
