---
layout: home
title: Home
custom_js: rand-fact-fetcher
---
<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css" rel="stylesheet" />
<link rel="alternate" type="application/rss+xml" href="{{ site.url }}/feed.xml">
{% seo %}
{% include ga.html %}


### Blog stuff
- [math](/math-archive)
<!-- - [finance](/fin-archive) -->
- [computer-science](/cs-archive)


### Projects

<ul style="list-style-type: disc; padding-left: 1.5rem;">
{% for project in site.projects %}
 <li style="margin-bottom: 1rem;">
    <strong style="vertical-align: middle;">
      <a href="{{ project.github }}" style="vertical-align: middle;">
        {{ project.title }}
      </a>
    </strong>
    <span style="margin-left: 0.5rem;">
      <a href="{{ project.github }}" style="vertical-align: text-bottom; display: inline-block;">
        <img src="{{ project.stars_badge }}" alt="Stars" style="vertical-align: text-bottom; display: inline-block;" />
      </a>
      <a href="{{ project.cratesdotio }}" style="vertical-align: text-bottom; display: inline-block;">
        <img src="{{ project.downloads_badge }}" alt="Downloads" style="vertical-align: text-bottom; display: inline-block;" />
      </a>
      <a href="{{ project.docs }}" style="vertical-align: text-bottom; display: inline-block;">
        <img src="{{ project.docs_badge }}" alt="Documentation" style="vertical-align: text-bottom;  display: inline-block;" />
      </a>
      {% if project.extra_link and project.extra_link_text %}
        <a href="{{ project.extra_link }}" style="vertical-align: text-bottom; display: inline-block;">
          {{ project.extra_link_text }}
        </a>
      {% endif %}
    </span>
    <div style=";">
      {{ project.description }}

    </div>
  </li>
{% endfor %}
</ul>

### Writings
<ul style="list-style-type: disc; padding-left: 1.5rem;">
{% for writing in site.writings %}
 <li style="margin-bottom: 1rem;">
    <strong style="vertical-align: middle;">
      <a href="{{ writing.link }}" style="vertical-align: middle;">
        {{ writing.title }}
      </a>
    </strong>
    <div style=";">
      {{ writing.description }}
    </div>
  </li>
{% endfor %}
</ul>





<!-- <div style="padding-top: 80px; padding-bottom: 80px;">
 {% include rand-fact-button.html %}
</div> -->


{% include footer.html %}

