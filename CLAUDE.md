# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A [Bridgetown](https://www.bridgetownrb.com/) static site that renders ABC music notation as interactive sheet music with audio playback and transposition. Songs are stored as `.abc` files; Bridgetown builders transform them into HTML pages using the [abcjs](https://paulrosen.github.io/abcjs/) JavaScript library.

## Commands

```bash
# Development server (live reload)
bin/bridgetown start

# Production build
rake deploy        # clean + frontend:build + bridgetown build

# Build only
rake test          # build with BRIDGETOWN_ENV=test

# Frontend only
yarn run esbuild          # minified build
yarn run esbuild-dev      # watch mode
```

## Architecture

### Data flow

1. `.abc` files in `src/_songs/` are the source of truth for music content.
2. `plugins/builders/abc.rb` (a Bridgetown Builder) reads every `.abc` file at build time, parses out the `T:` (title) and `B:` (book/collection title) headers, and calls `add_resource` to synthesize a virtual Markdown page in the `:songs` collection.
3. Each generated resource gets layout `:abc` and a permalink of `/songs/{folder}/{slug}.html`. Top-level songs (not in a subdirectory) omit the folder segment.
4. The `abc` layout (`src/_layouts/abc.liquid`) wraps the page content and adds a fixed player bar (audio + transpose select + tablature checkbox).
5. On page load, `frontend/javascript/index.js` reads each `<pre class="tune-source">` element (embedded verbatim ABC text) and calls `abcjs.renderAbc()` to draw notation into the adjacent `.paper` div, then sets up Web Audio synthesis.

### Song collections (subdirectories)

Songs can be grouped into named collections by placing them in a subdirectory under `src/_songs/` (e.g. `src/_songs/ff_guitar_solo/`). Each subdirectory should have an `index.md` with:

```yaml
---
title: Collection Display Name
song_folder: ff_guitar_solo   # must match the directory name
layout: song_index
---
```

The `song_index` layout lists all songs where `song.data.folder` matches `song_folder`. The home page (`src/index.md`) uses the same approach with `song_folder:` left blank to show top-level songs.

### ABC file conventions

- `X:` — tune number (required; used to generate div IDs like `tune1`)
- `T:` — title; used as the page title when no `B:` is present
- `B:` — book/collection name; takes priority over `T:` as the page title (title is quoted in the output)
- `K:` — key; parsed by the JS to set the default transpose option so the score renders in concert pitch
- Multiple tunes in one file are split on `X:` and rendered sequentially, separated by `<hr/>`.

### Transpose logic

The transpose select in the player bar is populated relative to the song's original key. The JS maps each key to a semitone offset from C on the circle of fifths, then shifts all dropdown values so that selecting "C / Am" always results in `visualTranspose: 0` (concert pitch), and other keys shift accordingly. This means Aerophone-style wind instruments can transpose to their instrument key.

### `plugins/builders/ly.rb`

An in-progress builder for LilyPond (`.ly`) files that shares the same `T:`/`B:` header parsing and `add_resource` pattern as the ABC builder. Currently not wired to any source files.

### Frontend stack

- **esbuild** bundles `frontend/javascript/index.js` and PostCSS processes `frontend/styles/index.css`.
- **Bootstrap 5.2** is loaded from CDN (not bundled).
- **abcjs 6.x** is the only npm runtime dependency; loaded from the local bundle.
