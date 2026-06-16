---
layout: default
title: Home
---

## Books

<div class="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-3 mb-4">
  {% for book in collections.books.resources %}
    <div class="col">
      <div class="card h-100">
        <a href="{{ book.relative_url }}">
          <img src="{{ book.data.cover_image }}" class="card-img-top" alt="{{ book.data.title }}">
        </a>
        <div class="card-body">
          <h5 class="card-title mb-0">
            <a href="{{ book.relative_url }}" class="text-decoration-none stretched-link">{{ book.data.title }}</a>
          </h5>
        </div>
        <div class="card-footer text-muted">
          {{ book.data.songs.size }} songs
        </div>
      </div>
    </div>
  {% endfor %}
</div>

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
