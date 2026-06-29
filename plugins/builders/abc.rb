class Builders::Abc < SiteBuilder
  def build
    Dir['src/_songs/**/*.abc'].sort.each do |file|
      content = File.read(file)

      content.split(/(?=^X:)/).each do |tune_block|
        tune_block = tune_block.strip
        next unless tune_block.start_with?('X:')

        tune_title = parse_field(tune_block, 'T')
        tune_book  = parse_field(tune_block, 'B')
        tune_game  = parse_field(tune_block, 'G')
        tune_track = tune_block.match(/^X:\s*(\d+)/)&.captures&.first&.to_i || 0
        tune_instrument = midi_instrument(tune_block)
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
          layout :abc
          permalink song_url
          content tune_block
          track tune_track
          instrument tune_instrument
          source_file file
        end
      end
    end
  end

  private

  def midi_instrument(text)
    program = text.match(/^%%MIDI program\s+\d+\s+(\d+)/)&.captures&.first.to_i
    case program
    when 24..31
      "guitar"
    when 72..79
      "ocarina"
    else
      "piano"
    end
  end

  def parse_field(text, letter)
    text.match(/^#{letter}:(.*)/)&.captures&.first&.strip.then { |v| v&.empty? ? nil : v }
  end

  def slugify(str)
    str.downcase.gsub(/[^a-z0-9]+/, '-').gsub(/^-+|-+$/, '')
  end
end
