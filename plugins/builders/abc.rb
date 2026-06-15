class Builders::Abc < SiteBuilder
  def build
    songs_by_book = Hash.new { |h, k| h[k] = [] }
    songs_by_game = Hash.new { |h, k| h[k] = [] }

    Dir['src/_songs/**/*.abc'].sort.each do |file|
      content = File.read(file)

      content.split(/(?=^X:)/).each do |tune_block|
        tune_block = tune_block.strip
        next unless tune_block.start_with?('X:')

        tune_title = parse_field(tune_block, 'T')
        tune_book  = parse_field(tune_block, 'B')
        tune_game  = parse_field(tune_block, 'G')
        next unless tune_title

        tune_slug     = slugify(tune_title)
        book_slug     = tune_book && slugify(tune_book)
        game_slug     = tune_game && slugify(tune_game)
        tune_book_url = tune_book && "/books/#{book_slug}/"
        tune_game_url = tune_game && "/games/#{game_slug}/"

        song_meta = { "title" => tune_title, "book" => tune_book, "game" => tune_game, "slug" => tune_slug }
        songs_by_book[tune_book] << song_meta if tune_book
        songs_by_game[tune_game] << song_meta if tune_game

        tune_content = <<~HTML
          <div class="tune" id="tune1">
            <div class="paper" id="tune1-paper"></div>
          </div>
          <pre class="tune-source" id="tune1-source">
          #{tune_block}
          </pre>
        HTML

        add_resource :songs, "#{tune_slug}.md" do
          title tune_title
          book tune_book
          game tune_game
          book_url tune_book_url
          game_url tune_game_url
          layout :abc
          permalink "/songs/#{tune_slug}/"
          content tune_content
        end
      end
    end

    songs_by_book.each do |book_name, book_songs|
      bslug = slugify(book_name)
      add_resource :books, "#{bslug}.md" do
        title book_name
        songs book_songs
        layout :book_index
        permalink "/books/#{bslug}/"
        content ""
      end
    end

    songs_by_game.each do |game_name, game_songs|
      gslug = slugify(game_name)
      add_resource :games, "#{gslug}.md" do
        title game_name
        songs game_songs
        layout :game_index
        permalink "/games/#{gslug}/"
        content ""
      end
    end
  end

  private

  def parse_field(text, letter)
    text.match(/^#{letter}:(.*)/)&.captures&.first&.strip.then { |v| v&.empty? ? nil : v }
  end

  def slugify(str)
    str.downcase.gsub(/[^a-z0-9]+/, '-').gsub(/^-+|-+$/, '')
  end
end
