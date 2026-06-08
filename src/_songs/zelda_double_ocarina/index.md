---
# Feel free to add content and custom Front Matter to this file.
title: The Legend of Zelda for Double Ocarina
song_folder: zelda_double_ocarina
layout: default
---

<h2><a href="/">Home</a></h2>

<h2>Songs</h2>

<ul class="list-group">
  {% for song in collections.songs.resources %}
    {% if song.data.folder == page.data.song_folder %}
      <li class="list-group-item">
      <a href="{{ song.relative_url }}">{{ song.data.title }}</a>
      </li>
    {% endif %}
  {% endfor %}
</ul>
