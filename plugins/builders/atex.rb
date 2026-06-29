class Builders::Atex < SiteBuilder
  def build
    Dir['src/_songs/**/*.atex'].sort.each do |file|
      content = File.read(file)

      tune_title    = parse_field(content, 'title')
      tune_subtitle = parse_field(content, 'subtitle')
      next unless tune_title

      tune_slug    = slugify(tune_title)
      song_url     = "/atex/#{tune_slug}/"
      file_content = content

      add_resource :atex_songs, "#{tune_slug}.md" do
        title tune_title
        subtitle tune_subtitle
        atex_content file_content
        layout :atex
        permalink song_url
        content ""
      end
    end
  end

  private

  def parse_field(text, field)
    text.match(/^\\#{field}\s+"([^"]+)"/)&.captures&.first
  end

  def slugify(str)
    str.downcase.gsub(/[^a-z0-9]+/, '-').gsub(/^-+|-+$/, '')
  end
end
