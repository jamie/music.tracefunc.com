class Builders::Indexes < SiteBuilder
  def build
    hook :site, :post_read do
      songs_by_book = Hash.new { |h, k| h[k] = [] }
      songs_by_game = Hash.new { |h, k| h[k] = [] }

      site.collections[:songs].resources.each do |resource|
        d = resource.data
        song_meta = {
          "title" => d.title, "book" => d.book, "game" => d.game,
          "url" => resource.relative_url, "track" => d.track.to_i,
          "instrument" => d.instrument, "file" => d.source_file
        }
        songs_by_book[d.book] << song_meta if d.book
        songs_by_game[d.game] << song_meta if d.game
      end

      songs_by_book.each do |book_name, book_songs|
        bslug = slugify(book_name)
        sorted = book_songs.sort_by { |s| [s["file"] ? File.basename(s["file"], ".*").to_i : 0, s["track"], s["title"]] }
        image_path = File.join("src", "images", "#{bslug}.webp")
        cover_image = File.exist?(image_path) ? "/images/#{bslug}.webp" : "/images/missing-cover.webp"
        stub_path = File.join("src", "_books", "#{bslug}.md")
        book_content = File.exist?(stub_path) ? File.read(stub_path) : ""
        add_resource :books, "#{bslug}.md" do
          title book_name
          songs sorted
          cover_image cover_image
          layout :book_index
          permalink "/#{bslug}/"
          content book_content
        end
      end

      songs_by_game.each do |game_name, game_songs|
        gslug = slugify(game_name)
        sorted = game_songs.sort_by { |s| [s["track"], s["title"]] }
        add_resource :games, "#{gslug}.md" do
          title game_name
          songs sorted
          layout :game_index
          permalink "/sources/#{gslug}/"
          content ""
        end
      end
    end
  end

  private

  def slugify(str)
    str.downcase.gsub(/[^a-z0-9]+/, '-').gsub(/^-+|-+$/, '')
  end
end
