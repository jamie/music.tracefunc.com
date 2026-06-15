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
        tune_x     = tune_block.match(/^X:\s*(\d+)/)&.captures&.first&.to_i || 0
        next unless tune_title

        tune_slug  = slugify(tune_title)
        book_slug  = tune_book && slugify(tune_book)
        game_slug  = tune_game && slugify(tune_game)
        song_url   = tune_book ? "/#{book_slug}/#{tune_slug}/" : "/songs/#{tune_slug}/"
        book_url   = tune_book && "/#{book_slug}/"
        game_url   = tune_game && "/sources/#{game_slug}/"

        song_meta = {
          "title" => tune_title, "book" => tune_book, "game" => tune_game,
          "slug" => tune_slug, "url" => song_url, "x" => tune_x
        }
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
          book_url book_url
          game_url game_url
          layout :abc
          permalink song_url
          content tune_content
        end
      end
    end

    songs_by_book.each do |book_name, book_songs|
      bslug = slugify(book_name)
      sorted = book_songs.sort_by { |s| [s["x"], s["title"]] }
      add_resource :books, "#{bslug}.md" do
        title book_name
        songs sorted
        layout :book_index
        permalink "/#{bslug}/"
        content ""
      end
    end

    songs_by_game.each do |game_name, game_songs|
      gslug = slugify(game_name)
      sorted = game_songs.sort_by { |s| [s["x"], s["title"]] }
      add_resource :games, "#{gslug}.md" do
        title game_name
        songs sorted
        layout :game_index
        permalink "/sources/#{gslug}/"
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
