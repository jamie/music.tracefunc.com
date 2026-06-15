---
layout: default
title: Home
---

## Books

<ul class="list-group mb-4">
  {% for book in collections.books.resources %}
    <li class="list-group-item d-flex justify-content-between align-items-center">
      <a href="{{ book.relative_url }}">{{ book.data.title }}</a>
      <span class="badge bg-secondary rounded-pill">{{ book.data.songs.size }}</span>
    </li>
  {% endfor %}
</ul>

## Games

<ul class="list-group mb-4">
  {% for game in collections.games.resources %}
    <li class="list-group-item d-flex justify-content-between align-items-center">
      <a href="{{ game.relative_url }}">{{ game.data.title }}</a>
      <span class="badge bg-secondary rounded-pill">{{ game.data.songs.size }}</span>
    </li>
  {% endfor %}
</ul>

{% assign other_songs = "" | split: "" %}
{% for song in collections.songs.resources %}
  {% unless song.data.book or song.data.game %}
    {% assign other_songs = other_songs | push: song %}
  {% endunless %}
{% endfor %}
{% if other_songs.size > 0 %}
## Other Songs

<ul class="list-group">
  {% for song in other_songs %}
    <li class="list-group-item">
      <a href="{{ song.relative_url }}">{{ song.data.title }}</a>
    </li>
  {% endfor %}
</ul>
{% endif %}

## [Links & Reference](/reference)
