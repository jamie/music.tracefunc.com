---
# Feel free to add content and custom Front Matter to this file.

layout: default
---

<ul class="list-group">
  {% for song in collections.songs.resources %}
    <li class="list-group-item">
      <a href="{{ song.relative_url }}">{{ song.data.title }}</a>
    </li>
  {% endfor %}
</ul>
