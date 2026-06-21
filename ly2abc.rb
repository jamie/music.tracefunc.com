require 'stringio'
class Converter
  def initialize(input)
    stripped = input.gsub(/%[^\n]*/, "")
    @tokens = stripped.split(/\s+/).reject(&:empty?)
    @output = StringIO.new("")
    @voice_id = 0
  end

  def read_args(n)
    n.times.map do
      token = @tokens.shift
      if token == "{"
        block = []
        block << @tokens.shift until @tokens.first == "}"
        @tokens.shift
        block
      else
        token
      end
    end
  end

  def convert
    while token = @tokens.shift
      if token.start_with?("\\")
        send(:"t_#{token[1..].gsub('-', '_')}")
      elsif token.start_with?("#(")
        send(:"t_#{token[2..].gsub('-', '_')}")
      end
    end
  end

  def unquote(str) = str.delete_prefix('"').delete_suffix('"')

  def t_version = read_args(1)
  def t_set_global_staff_size = read_args(1)
  def t_include = read_args(1)
  def t_score = read_args(1)

  def t_header
    args = {}
    tokens = read_args(1)[0]
    while tokens.any?
      k, _ = tokens.shift(2)
      v = [tokens.shift]
      v << tokens.shift until v.last.end_with?('"')
      args[k] = unquote(v.join(" "))
    end
    @output.puts "X: 1"
    @output.puts "T: #{[args["title"], args["subtitle"]].compact.join(" - ")}"
    @output.puts "C: #{args["composer"]}"
  end

  def t_relative
    @voice_id += 1
    @output.puts StaffConverter.new(@voice_id, *read_args(2)).to_s
  end

  def to_s
    convert
    @output.rewind
    @output.read
  end
end

class StaffConverter
  ACCIDENTALS = {
    "is" => "^",
    "es" => "_",
    nil => "",
    "" => "",
  }

  def initialize(voice_id, relative, voice)
    @voice_id = voice_id
    @relative = relative
    @input = voice
    @octave = case @relative
    when "c," then 1
    when "c" then 2
    when "c'" then 3
    when "c''" then 4
    else raise "Unexpected relative #{@relative.inspect}"
    end
    @last_note = "c"
  end

  def unquote(str) = str.delete_prefix('"').delete_suffix('"')

  def to_s
    notes = parse
    out = []
    out << @voice
    if @voice_id == 1
      out << @meter
      out << "L: 1/4"
      out << @tempo
      out << @key
    end
    out << notes
    out.compact.join("\n")
  end

  def parse
    notes = ""
    bars = 0
    measure = 0.0
    duration = 1
    part = "A"
    in_bar = false
    voice = @input.dup
    @timesig = 4

    while voice.any?
      len = 0
      case tok = voice.shift
      when "\\tempo"
        @tempo = "Q: 1/#{voice.shift}#{voice.shift}"
      when "\\time"
        time = voice.shift
        @timesig = if time == "C"
          4
        else
          time.split("/").map(&:to_f).inject(:/)*4
        end
        if @meter
          notes << "[M: #{time}] "
        else
          @meter = "M: #{time}"
        end
      when "\\key"
        key_name = voice.shift
        is_minor = voice[0] == "\\minor"
        is_major = voice[0] == "\\major"
        @key = "K: #{key_name.upcase}"
        if is_minor
          @key += "m"
          voice.shift
        end
        if is_major
          voice.shift
        end
        @key_sig = case [key_name, is_minor]
        in ["g",   false] then { "f" => "is" }
        in ["bes", false] then { "b" => "es", "e" => "es" }
        in ["c",   true]  then { "b" => "es", "e" => "es", "a" => "es" }
        else {}
        end
      when "\\clef"
        @octave += 1 if voice[0] == "bass" # Adjustment for Fight 2
        @voice = "V:#{@voice_id} clef=#{voice.shift}"
      when "\\break"
        # Noop, manual hinting for lilypond auto-layout
      when "\\mark"
        mark = voice.shift
        if mark =~ /default/
          mark = part
          part = part.succ
        end
        notes << "[P:#{unquote(mark)}] "
      when "\\set"
        voice.shift until voice[0].end_with?(")")
        voice.shift
      when /#\(/
        voice.shift
      when "\\bar"
        voice.shift # TODO by hand?
      when /^(<)?([abcdefgr])(s|is|es)?([,']*)(\d+\.?)?([-_]\d)?([\[\]>~]*)$/
        chording = $1
        pitch = $2
        accidental = $3
        octave = $4
        note_duration = $5
        finger = $6
        trailer = $7

        if chording == "<"
          # Collect notes until we hit the closing `>`, consuming from voice.
          # Each note inside the chord is relative to the previous one (standard
          # LilyPond relative mode), but after the chord @last_note resets to
          # the first note so the next note is relative to it.
          chord_abc = []
          chord_abc << convert_note(pitch, accidental, octave)
          first_note_name = @last_note
          first_note_octave = @octave

          until trailer.include?(">")
            chord_tok = voice.shift
            chord_tok =~ /^([abcdefg])(s|is|es)?([,']*)([-_]\d)?(>)?(\d+\.*)?([\[\]~]*)$/
            chord_abc << convert_note($1, $2, $3)
            finger = $4
            chord_end = $5
            note_duration = $6 unless ($6 || "").empty?
            trailer = $7 || ""
            # pp [chord_tok, $1, $2, $3, $4, $5, $6, $7]
            break if chord_end
          end

          @last_note = first_note_name
          @octave = first_note_octave
          note = "[#{chord_abc.join}]"
        else
          # Single
          note = convert_note(pitch, accidental, octave)
        end

        suffix = ""
        suffix << "-" if trailer =~ /~/
        in_bar = true if trailer =~ /\[/
        in_bar = false if trailer =~ /\]/
        suffix << " " unless in_bar

        if note_duration
          duration = note_duration.to_i
          duration /= 1.1666666 if note_duration.end_with?("..")
          duration /= 1.5 if note_duration.end_with?(".")
        end
        len = 4.0/duration
        p [tok, note_duration, duration, 4.0/duration] if note_duration =~ /16/
        measure += len
        case len.round(2)
        when 3.5 then len = "7/"
        when 1.5 then len = "3/"
        when 0.5 then len = "/"
        when 0.25 then len = "//"
        when 1 then len = ""
        else len = len.to_i
        end

        notes << "#{note}#{len}#{suffix}"
      else
        puts "Unhandled token: #{tok}"
      end

      if measure >= @timesig - 0.01
        notes << "| "
        measure = 0.0
        bars += 1
      end
      if bars == 4
        notes << "\n"
        bars = 0
      end
    end
    notes << "|]"
  end

  def convert_note(note, accidental, octave)
    note = "z" if note == "r"

    @octave += octave_adjust(note, accidental, octave)
    @last_note = note

    "#{abc_accidental(note, accidental)}#{octaviated(note)}"
  end

  def abc_accidental(note, accidental)
    key_acc = (@key_sig || {})[note]
    if (accidental || "") == (key_acc || "")
      ""       # key signature covers it
    elsif (accidental || "") == ""
      "="      # natural contradicts the key signature
    else
      ACCIDENTALS[accidental]
    end
  end

  def octave_adjust(note, accidental, octave)
    adjust = 0
    adjust += 2 if octave == "''"
    adjust += 1 if octave == "'"
    adjust -= 1 if octave == ","
    adjust -= 2 if octave == ",,"

    # Adjust based on distance between note and last_note, by lilypond logic
    # https://lilypond.org/doc/v2.24/Documentation/notation/writing-pitches#relative-octave-entry
    note_names = %w[c d e f g a b]
    prev_idx = note_names.index(@last_note)
    curr_idx = note_names.index(note)
    if prev_idx && curr_idx
      # Find the diatonic octave that places `note` closest to `@last_note`.
      # Each octave spans 7 diatonic steps; round to the nearest one.
      prev_abs = @octave * 7 + prev_idx
      nearest_octave = ((prev_abs - curr_idx) / 7.0).round
      adjust += nearest_octave - @octave
    end

    adjust
  end

  def octaviated(note)
    return unless note
    return note if note == "z"
    case @octave
    when 0 then note.upcase + ",,,,"
    when 1 then note.upcase + ",,,"
    when 2 then note.upcase + ",,"
    when 3 then note.upcase + ","
    when 4 then note.upcase
    when 5 then note.downcase
    when 6 then note.downcase + "'"
    when 7 then note.downcase + "''"
    when 8 then note.downcase + "'''"
    when 9 then note.downcase + "''''"
    else raise "Unexpected octave: #{@octave}"
    end
  end
end

if __FILE__ == $0
  puts Converter.new(File.read(ARGV[0])).to_s
  puts
  puts
end
