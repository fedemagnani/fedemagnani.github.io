---
layout: home
title: Home
---
<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css" rel="stylesheet" />
<link rel="alternate" type="application/rss+xml" href="{{ site.url }}/feed.xml">
{% seo %}


### Blog stuff (WIP)
- [math](/math-archive)
- [computer-science](/cs-archive)


### Projects

<ul>
{% for project in site.projects %}
<li>
  <strong><a href="{{ project.github }}">{{ project.title }}</a></strong>
  <a href="{{ project.github }}"><img src="{{ project.stars_badge }}" alt="Stars" style="display:inline-block" /></a>
  <a href="{{ project.cratesdotio }}"><img src="{{ project.downloads_badge }}" alt="Downloads" style="display:inline-block" /></a>
  <a href="{{ project.docs }}"><img src="{{ project.docs_badge }}" alt="Docs" style="display:inline-block" /></a>
  {% if project.extra_link and project.extra_link_text %}
    <a href="{{ project.extra_link }}">{{ project.extra_link_text }}</a>
  {% endif %}
  <div>{{ project.description }}</div>
</li>
{% endfor %}
</ul>

### Writings

<ul>
{% for writing in site.writings %}
<li>
  <strong><a href="{{ writing.link }}">{{ writing.title }}</a></strong>
  <div>{{ writing.description }}</div>
</li>
{% endfor %}
</ul>


{% include footer.html %}
