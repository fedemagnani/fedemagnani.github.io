---
share: false
layout: post
title: "Convexificattention"
category: math
goal: provide a pure, intimate understanding of the attention mechanism
core concepts:
     - we focus on attention only
     - word -> token -> embedding
     - into attention:
       - embedding is not enough poor meaning,
       - a simple feed-forward layer transform autonomously each row of the input matrix
       - so you need a "technology" to mix information emitted by each row, with a certain combination
       - source vs sink tokens
       - weighted sum of contributions
       - soft dictionary lookup
---

If in recent years you peeked into the LLM rabbit hole, you probably encountered the word *attention* so often that it started to feel like something you already understand. Yet, precisely because it is everywhere, it is very easy to not pay attention to what attention really is.

This post discusses the attention mechanism, and it is the first of (potentially) a few posts I'd like to write around LLMs. As in my other posts, I'm not aiming at a rigorous or exhaustive treatment of the topic. Instead, I want to look at the mechanism from a curious angle and offer some inputs that help spark the intuition behind it, so that it becomes easier to recall and to reason about.

Of course, attention is deeply tied to the transformer architecture, but here I'd like to keep the focus on the mechanism itself, stripping it away from the architecture. Given how closely the two are bound, a few crumbs of the transformer will inevitably show up here and there, but only at surface level. If instead you are interested in the transformer architecture as a whole, [bbycroft.net/llm](https://bbycroft.net/llm) is a really cool resource: it renders the layers of some GPT-style models (such as GPT-2 and GPT-3) in 3D and lets you interact with each of them. These models might look embarrassing compared with the most recent ones, but their papers are the richest in details, while the papers of more recent models are mostly a "diff" with respect to the preceding state of the art.

## Digesting text

Despite consuming and producing natural language, a language model does not itself “reason” in natural language: it needs a numerical representation of the text it receives. To obtain one, it first converts the input into a compact sequence of integers. This process is called **tokenization** and leverages well-known data compression techniques such as BPE (introduced in 1994 and [repurposed for language models](https://arxiv.org/abs/1508.07909) only much later).

The goal is to build a vocabulary: a map from strings to integers, where each integer identifies an *atom* of the LLM's representation of natural language. This integer representation is called a **token**. Of course, each tokenizer involves trade-offs and tries to perform well against several objectives: it should be flexible enough to handle neologisms, ensure that a word does not need to be split into too many tokens (which would require multiple forward passes to produce it, increasing the risk of misspelling), and, at the same time, keep the vocabulary size under control, since it has a direct impact on the model's memory requirements.

Tokens, however, are just labels: they don't carry any meaning by themselves. The actual mathematical representation of the input, which undergoes all the transformations performed during the model's evaluation, is the **embedding**. Each token in the vocabulary is associated with a vector of real numbers, and all these vectors are stacked as the rows of a huge matrix $$E \in \mathbb{R}^{M \times d}$$, where $$M$$ is the vocabulary size and $$d$$ is the embedding dimension (768 for the smallest GPT-2 model). A token simply acts as an index used to retrieve the associated row: embedding is literally a hard dictionary lookup, where the token is the key and the row is the value.

Unlike the vocabulary, which is built upfront, the entries of this matrix are learned during training. The model tweaks them to encode, from its own perspective, the “meaning” of each token in a multidimensional form. As a result, embedding a string means using the vocabulary to encode it into one or more tokens and then performing a lookup using those tokens as row selectors. The embedding representation of a string is therefore either a single row vector or several row vectors stacked into a matrix.

![embedding]({{ site.baseurl }}/assets/images/embedding.png)

In particular, embedding the entire input text returns the matrix

$$
X \in \mathbb{R}^{n \times d}
$$

where $$n$$ is the number of tokens and the $$i$$-th row $$x_i$$ is the embedding of the $$i$$-th token.

Notice that, unlike the traditional linear algebra convention, in which vectors are stacked as columns, here they are stacked as rows. This is the standard convention in machine learning (think of the observations in a regression analysis, which occupy the rows of the design matrix). It is also probably a matter of *mechanical sympathy*: with row-major storage, each row is contiguous in memory, so a single cache line hands you a bunch of its entries for free, while iterating over a column requires strided access, which is much more costly.

### Colors are our embedding space

The concept of an embedding might be a bit difficult to grasp the first time you encounter it. For this reason, I find that the visual systems of organisms (including us!) provide a powerful analogy that helps build intuition. In particular, we could say that colors don't exist in nature as an autonomous physical property of objects. Rather, they can be understood as the experience produced by our visual system when it encodes and interprets the light reflected by the objects in the scene we are looking at.

As a very short and terribly inaccurate primer: light is an electromagnetic wave that can be decomposed, through a Fourier transform, into a continuous sum of sinusoidal components, each with its own wavelength. The collection of these components, with their different wavelengths, defines the *spectrum* of the light source. Photons are distributed across this spectrum, but not all the wavelengths in it can be processed by every organism's eyes. Different organisms may differ in which wavelengths they can detect.

Human eyes, for example, can detect wavelengths ranging from approximately 380 nm to 780 nm. At the lower end of this range we find violet wavelengths; wavelengths below it define the ultraviolet (UV) range, typically associated with skin aging, sunburns, and vitamin D synthesis. UV wavelengths are mostly invisible to the human eye, but they are visible to other organisms, including pigeons, goldfish, bees, and many other animals.

What is extremely interesting about this is that we can interpret the **color space** known to each species as the **embedding space of the visible spectrum of light** for that species. We can appreciate this analogy by understanding how organisms actually extract information from light.

In organisms with cone-based color vision, light information is captured by cone cells. Humans have around 6 million of these comb-shaped cells across the retina. Despite this huge number, these cells generally belong to a fixed number of *cone types*: humans have just three and are therefore considered *trichromatic* organisms (from the Greek *tri* = 3 and *chroma* = color), like honeybees. Dogs and cats, in contrast, have just two cone types and are therefore considered *dichromatic*.

<figure style="margin: 1.5em 0; text-align: center;">
  <img src="{{ site.baseurl }}/assets/images/cone-cell.svg" alt="cone cell structure" style="width: 70%;">
  <figcaption>credits: <a href="https://oscarwylee.ca/glasses/eye/cone-cells">Oscar Wylee</a></figcaption>
</figure>

What distinguishes one cone type from another is its *sensitivity* to photons at different wavelengths. This sensitivity is typically bell-shaped: a cone type is most effective at capturing photons within a certain range of wavelengths, and its sensitivity decreases as we move away from that range. Humans have three types of color-sensitive cones, conventionally referred to as:

- $$s$$, for the cone type that is more sensitive to short wavelengths (i.e., closer to violet), peaking at around 420 nm;
- $$m$$, for the cone type that is more sensitive to medium wavelengths, peaking at around 530 nm;
- $$l$$, for the cone type that is more sensitive to long wavelengths, peaking at around 560 nm.

<!-- <img src="https://thumb.wikimedia.org/wikipedia/commons/thumb/0/04/Cone-fundamentals-with-srgb-spectrum.svg/3840px-Cone-fundamentals-with-srgb-spectrum.svg.png?utm_source=en.wikipedia.org&utm_campaign=imageinfo&utm_content=thumbnail">

<img src="https://d2o51ft7emegr.cloudfront.net/pub/media/wysiwyg/image-folder/glasses/eye/cone-cells/02-S-Cone-M-Cone-L-Cone-900x600.jpg"> (credits https://oscarwylee.ca/glasses/eye/cone-cells) -->

These cones define the range of wavelengths we can see because wavelengths below approximately 380 nm (ultraviolet) and above approximately 780 nm (infrared) fall in the far tails of their sensitivity curves. Our cone cells are therefore very poor at capturing photons at these wavelengths, or effectively incapable of doing so.

Now, let $$N(\lambda)$$ be the number of photons in a tiny wavelength band centered at $$\lambda$$, and let $$p_s(\lambda)$$, $$p_m(\lambda)$$, and $$p_l(\lambda)$$ denote the sensitivities of the $$s$$, $$m$$, and $$l$$ cones at wavelength $$\lambda$$. We can then compute the expected number of photons captured by each cone type:

$$
S = \int N(\lambda)\,p_s(\lambda)\,d\lambda,\qquad
M = \int N(\lambda)\,p_m(\lambda)\,d\lambda,\qquad
L = \int N(\lambda)\,p_l(\lambda)\,d\lambda.
$$

These cone-cell responses are typically called *quantum catches*. Each represents the expected number of photons captured by a particular cone type from the same light source.

As mentioned, wavelength affects only the probability that a photon will be absorbed by a particular cone, depending on its sensitivity. Once the photon is absorbed, however, its wavelength information is lost. This problem is known as *univariance* ([Rushton, 1972](https://pubmed.ncbi.nlm.nih.gov/4336741/)).

The issue is that many different light spectra can produce the same quantum catch in a given cone type. The quantum catch is a single-variable response, which is insufficient to characterize the light spectrum being processed: infinitely many candidate spectra can map to the same response. Trivially, if the response $$L$$ is very high, we cannot tell whether this is caused by a modest number of photons at wavelengths where the $$l$$ cone's sensitivity peaks or by a flood of photons at wavelengths that the cone barely absorbs.

To resolve this ambiguity, we need to consider the quantum catches produced by the other cone types as well. For this reason, a more informative representation of the absorbed light spectrum is a vector collecting the three quantum catches, obtained from a population of cone cells of the three different types:

$$
[L,M,S]\in \mathbb{R}^3
$$

In this sense, the human retina maps a light spectrum to a point in $$\mathbb{R}^3$$. This is a lossy encoding that collects, in a single vector, the expected number of photons absorbed by each cone type in a given neighborhood. This is extremely nice because it gives us a geometrical representation of the color space defined by our cone cells (see [this visualization](https://horizon-lab.org/colorvis/cone2cmf.html)).

{% include cone-embedding-animation.html %}

This vectorial representation significantly mitigates the problem of univariance, but it is still a lossy encoding. Several different light spectra can map to the same point $$[L,M,S]$$, although there are fewer such spectra than in the single-quantum-catch case. This is why we experience *metamerism*: we can perceive two very different light spectra as identical. For instance, under a particular light source, two objects can appear to have the same color because their reflected light spectra, despite being different, produce the same $$[L,M,S]\in\mathbb{R}^3$$. Change the light source, however, and the two objects may look different.

Thus, $$[L,M,S]$$ is a primitive vectorial representation of the information captured by the human eye from external light. Each entry, taken alone, tells us very little about the captured information because of the univariance problem. Taken together, however, the three entries provide a good enough representation of the light that has been captured.

This is incredibly similar to what an embedding vector does for a large language model: each coordinate, taken alone, is insufficient to capture the learned information of a certain token, but when grouped with the others, the coordinates provide a good enough representation of it.

As a result, in both cases we have an embedding space which, for the human visual system, corresponds to the color space. We can interpret it as an embedding space for vision: a vectorial representation of the external world that our visual system builds from the light reaching our eyes. **It is a coordinate system that makes sense to our brain because it emerged over an enormous amount of evolutionary time, shaped by a very practical target function: survival and reproductive success**. It provides humans with an ergonomic, lossy but efficient representation of light information, allowing us to identify food, such as fruits and young leaves ([Regan et al., 2001](https://royalsocietypublishing.org/rstb/article-abstract/356/1407/229/19752/Fruits-foliage-and-the-evolution-of-primate-colour?redirectedFrom=fulltext); [Dominy and Lucas, 2001](https://pubmed.ncbi.nlm.nih.gov/11268211/)), as well as threats.

Of course, this embedding space is very specific to humans: it is rooted in the three different cell cone types, each with their own sensitivity, and also in the rest of our visil system, which determines how these signals are processed and interpreted by downstream components such as the visual cortex.

Similiar to embedding spaces of different models, trained on the same corpus of text, also in nature the same external source does not necessarily give rise to the same internal representation across different species, and also the interpretation of the same representation would differ. **Such vectorial representations indeed are not meant to provide an objective or faithful description of the external source, but instead they are purely instrumental to the system consuming them to optimize its target function: if the resulting representation happens to be interpretable, this is largely incidental to its actual purpose**. Both for embedding vectors and LMS tristimulus vectors, their coordinates are not designed to correspond to human-interpretable concepts, nor does each dimension need to have a meaningful interpretation on its own: they are learned representations that serve the model's training target function. In nature, the training target can be easily abstracted across most of the organisms: **survive long enough to reproduce**, but the actual relevant environment in terms of food, threats and related components differ largely across species, hence producing very different and specialized vision embedding spaces. A fruit, for example, has a very different relevance to a human, a bee, or a goldfish. Over gazillions of years of evolution, each species has effectively been optimizing its own "version" of the same target function, shaped by the environment it inhabits. Vision has consequently evolved in different directions, producing different ways of encoding and interpreting light, resulting in different vision systems and associated embeeding spaces.

Goldfish and several bird species, for example, are *tetrachromatic*, meaning they have four different cone types: their vision embedding space lives in a higher dimension compared withn humans, and this this richer internal representation allows them to distinguish a greater variety of light spectra hence experiencing a lower number of metamers compared with us. Honeybees instead are *trichromatic* like humans, but their visible spectrum extends approximately from ~300 to ~650 nm, and their sensitivity functions are shifted much more toward violet. They are essentially blind to red, while being way more sensitive than us to UV wavelengths. For the same reason, there may be animals that can experience colors we cannot even imagine, how crazy is that?

After all, color is not an intrinsic property of light itself, but rather a consequence produced by the perceptual experience of our visual system, which builds an internal representation of it. This is, to me, the really fascinating connection with large language models. **An embedding is not an "objective" or "unambiguous" representaion of the external source, but an internal and model-specific representation of it**.  For an LLM, the source is a token in a text corpus; for a visual system, it is the light reaching the eye. In both cases, **the representation is shaped by the architecture that processes it and by the target that the system has evolved or been trained to optimize**. This teaches us that **knowledge can be purely instrumental for a certain goal and, in general, a learned representation of reality is not necessarily a faithful description of reality: rather it is a way of encoding information that makes sense for the system consuming it**. A representation doesn't need to preserve everything about the thing being represented. It needs to preserve the information that matters for whatever you want to do with it. The evolutionary story of how, over so many of years of training, each species developed its own visual embedding space for very practical reasons associated with reproductive success and related subgoals is just so fascinating.