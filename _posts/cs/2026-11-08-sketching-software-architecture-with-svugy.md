---
share: true
layout: post
title: "Sketching software architecture with svugy"
category: cs
---

In this post I want to introduce [svugy](https://svugy.dev), a tool I made to create interactive isometric diagrams of software architectures, written as plain Markdown files.

While having always been fundamental, the architectural view of a codebase is something software engineers now have fewer excuses to ignore: with AI, writing code has become a commodity, and a clear picture of the architecture is what lets you steer the agent away from producing complete garbage. For tasks involving shaping a software architecture or understanding an existing one, I always follow the same methodology, in a `.md` file:

- a nested list of the core components, where indentation tells what lives inside what
- a list of the main workflows and dataflows, telling which component talks to which

The result is a sort of TL;DR of the architecture I am dealing with, and it becomes the ground from which I imagine it, or draw it with existing diagramming tools.

## The C4 model

I'm a big fan of the [C4 model](https://c4model.com) by Simon Brown. Instead of one big diagram, it describes an architecture at four levels of abstraction:

- **context**: the system and who uses it
- **containers**: the applications, databases and queues it is made of
- **components**: the pieces inside each container
- **code**: the classes and functions inside each component

Simon Brown also built [`structurizr`](https://github.com/structurizr/structurizr), where you describe the model once in a text DSL and get the diagrams for every level out of it. It is the main inspiration behind svugy, but I wanted to insist more on certain desiderata:

- **Portability**: one self-contained file that renders anywhere, without depending on a server or a viewer. 
- **Readability**: the source alone should tell the reader how the architecture is shaped, without learning a new language first.
- **Fun**: something nice to look at and to click around.
- **AI-friendliness**: agents should be able to read and write these diagrams on their own.

## Svugy

The natural choice was to make svugy read exactly the kind of file I was already writing. A diagram is a `.md` file with two sections, `## Components` and `## Edges`, which are the two lists from my notes:

- a component is a bullet, like `- api: API`, and the bullets indented under it are what it contains
- an edge is a bullet too, like `- api -> db: reads orders`

The rest of the rules are kept to a minimum: an optional frontmatter for title and styles, and optional `description` blocks to attach some prose to any component or edge.

Here is a tiny demo of svugy, compiled to wasm: as you type on the left panel in markdown, svugy renders the SVG on the right providing an interactive architecture

{% capture webapp %}{% include svugy/webapp.md %}{% endcapture %}
{% include svugy-live.html source=webapp svg="/assets/svugy/webapp.svg" %}

These are typical workflows where I like to include it:

- **Shaping a new architecture**: I write the two lists while thinking, and `svugy view my.md` re-renders the diagram in the browser on every save, so I see the shape of the design while I change it.
- **Exploring an existing codebase**: I ask an agent with the svugy skill to map the repo into a diagram, then I click from the top level down to the modules I care about, fixing the file wherever the agent got it wrong.
- **Writing docs**: I embed the exported SVGs in [mdbook](https://rust-lang.github.io/mdBook/) with an `<object>` tag, which keeps them interactive: the docs at [svugy.dev](https://svugy.dev/docs/run/markdown.html) are built exactly this way. 

The interactivity comes from a small runtime inlined in the SVG as a `<script>` tag. Some hosts, like GitHub READMEs, don't run scripts inside SVGs: there the diagram still shows, just without the clicking.

## Getting started
You can explore the codebase on [gitHub](https://github.com/fedemagnani/svugy), or head to [svugy.dev](https://svugy.dev) for more demos and the installation commands. There you will also find an installation prompt, to hand the setup off to whichever agent you like to use. svugy itself ships with a skill that helps your agent use it.
