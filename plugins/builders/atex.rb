class Builders::Atex < SiteBuilder
  def build
    Dir['src/_songs/**/*.atex'].sort.each do |file|
      content = File.read(file)

      tune_title = parse_field(content, 'title')
      tune_game  = parse_field(content, 'subtitle')
      tune_book  = parse_field(content, 'album')
      next unless tune_title

      tune_slug  = slugify(tune_title)
      book_slug  = tune_book && slugify(tune_book)
      game_slug  = tune_game && slugify(tune_game)
      song_url   = tune_book ? "/#{book_slug}/#{tune_slug}/" : "/songs/#{tune_slug}/"
      book_url   = tune_book && "/#{book_slug}/"
      game_url   = tune_game && "/sources/#{game_slug}/"

      add_resource :songs, "#{tune_slug}.html" do
        title tune_title
        book tune_book
        game tune_game
        book_url book_url
        game_url game_url
        layout :atex
        permalink song_url
        atex content
        content content
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
