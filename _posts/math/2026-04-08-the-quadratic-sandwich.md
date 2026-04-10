---
share: true
layout: post
title: "The quadratic sandwich"
category: math
---

If you have ever tried to minimize a function with gradient descent, you probably noticed that some functions are a joy to optimize and others are a nightmare. The difference often boils down to two properties: **strong convexity** and **L-smoothness**. These two concepts define a "sandwich" of quadratic bounds around your function that tells you *exactly* how well-behaved it is. If the sandwich is tight, life is good. If one slice of bread is missing, things get ugly fast.

In this post we'll build up both concepts from scratch, see how they combine into the quadratic sandwich, understand what happens at the level of the Hessian's eigenvalues, and pick up a neat trick to verify L-smoothness without ever computing an eigenvalue.

## [Strong convexity — the function can't be too flat](#strong-convexity)

A differentiable function $$f:\mathbb{R}^n\to\mathbb{R}$$ is $$\mu$$-strongly convex (with $$\mu > 0$$) if for all $$x, y$$

$$
f(y) \geq f(x) + \langle \nabla f(x), y - x \rangle + \frac{\mu}{2} \|y - x\|^2
$$

If this looks familiar, it's because the first two terms on the right are the first-order Taylor expansion of $$f$$ at $$x$$. For a plain convex function, the Taylor expansion is already a global underestimator (that's the subgradient inequality). But strong convexity asks for more: the function must stay above the tangent *plus a quadratic gap*. The parameter $$\mu$$ controls how aggressive this gap is — the bigger $$\mu$$, the more the function curves upward and away from its linear approximation.

The intuition is that a strongly convex function has a guaranteed minimum curvature of $$\mu$$ in every direction. It can't flatten out, it can't plateau, it can't have a degenerate valley where one direction is basically flat. There is always a force pulling you toward the minimum, and that force grows linearly with the distance from the minimizer.

{% include desmos.html
   src="https://www.desmos.com/calculator/wswrrpl586?embed"
   height="500" %}


## [L-smoothness — the function can't be too steep](#l-smoothness)

A differentiable function $$f$$ is $$L$$-smooth if its gradient is Lipschitz continuous:

$$
\|\nabla f(x) - \nabla f(y)\| \leq L \|x - y\| \quad \forall \; x, y
$$

Read this carefully: the change in the gradient between any two points is always dominated by a rescaled version of the change in the input. No matter how far apart $$x$$ and $$y$$ are, the gradient difference $$\|\nabla f(x) - \nabla f(y)\|$$ can never outpace $$L$$ times the input difference $$\|x - y\|$$. The constant $$L$$ acts as a leash on the gradient: it can move, but it can't jerk. No abrupt turns, no sudden spikes in curvature.

Now here's the equivalent characterization that will matter for the sandwich, sometimes called the **descent lemma**: if $$f$$ is convex and $$L$$-smooth, then for all $$x, y$$

$$
f(y) \leq f(x) + \langle \nabla f(x), y - x \rangle + \frac{L}{2}\|y - x\|^2
$$

This is not obvious from the Lipschitz condition alone — it requires a short derivation that we work out in the [Appendix](#appendix-descent-lemma). The key idea is to integrate the gradient along the segment from $$x$$ to $$y$$ and use Cauchy-Schwarz together with the Lipschitz bound to control the error.

Look at the structure: same shape as the strong convexity condition, but with the inequality flipped and $$\mu$$ replaced by $$L$$. The function now stays *below* its tangent plus a quadratic term. In other words, the function can bend, but not more than a quadratic with curvature $$L$$.

The parameter $$L$$ caps the maximum curvature in any direction. If strong convexity sets a floor on curvature, L-smoothness sets a ceiling.


{% include desmos.html
   src="https://www.desmos.com/calculator/92wwgqz2qd?embed"
   height="500" %}


## [The quadratic sandwich](#the-quadratic-sandwich)

Now we put both slices of bread together. If $$f$$ is $$\mu$$-strongly convex *and* $$L$$-smooth, then both inequalities hold simultaneously and for all $$x, y$$ we get

$$
\begin{cases}
f(x) + \langle \nabla f(x), y - x \rangle + \frac{\mu}{2}\|y - x\|^2 \leq f(y) \\[6pt]
f(y) \leq f(x) + \langle \nabla f(x), y - x \rangle + \frac{L}{2}\|y - x\|^2
\end{cases}
$$

The function is trapped between two parabolas centered at any point $$x$$: a tighter one from below (curvature $$\mu$$) and a wider one from above (curvature $$L$$). This is the quadratic sandwich.

The proof of the sandwich is worked out in the [Appendix](#appendix-descent-lemma).

{% include desmos.html
   src="https://www.desmos.com/calculator/awzmdi4ehw?embed"
   height="500" %}

### The condition number

The ratio 

$$
\kappa = \frac{L}{\mu}
$$

is called the **condition number** and it measures how thick the sandwich is. By construction, since $$L \geq \mu$$ (the maximum curvature can't be smaller than the minimum curvature), the condition number is always bounded below by 1: $$\kappa \geq 1$$. A small $$\kappa$$ (close to 1) means the function is "almost quadratic" — both bounds are tight, and the function is easy to optimize. A large $$\kappa$$ means the curvature varies wildly across directions, and this is where gradient descent starts to suffer. Think about it in two scenarios:

- **Some directions lack curvature** ($$\mu$$ is tiny): a small $$\mu$$ doesn't necessarily mean the function is flat — you could still have a nonzero slope. But it means you have no "acceleration" to exploit: the gradient barely changes from one iterate to the next, so you can't gauge whether you're getting closer to the minimum or how to adjust your step size. Think of walking on a constant slope — you're moving, but the terrain gives you no feedback about your progress.
- **The gradient changes too abruptly** ($$L$$ is huge): contrary to the lack of strong convexity — where the problem is that the gradient *doesn't* change — here the problem is that it changes *too much*. All of a sudden, between one iterate and the next, the gradient spikes or flips direction in a way that your step size didn't anticipate. Note that a large $$L$$ alone is not necessarily catastrophic: if $$\mu$$ is also large (high curvature everywhere), the function is just a steep but well-behaved bowl, and you can simply use a small step size $$1/L$$ that works uniformly.

The real trouble comes from the *spread* between $$L$$ and $$\mu$$ — a large condition number $$\kappa = L/\mu$$. When the gap is significant, some directions have high curvature (where the gradient changes fast) and others have low curvature (where the gradient is nearly constant). A single step size cannot serve both: sized for the high-curvature directions it's too conservative for the low-curvature ones, and vice versa. This mismatch is what causes the classic zigzagging behavior of gradient descent — it's not $$L$$ alone or $$\mu$$ alone, but the ill-conditioning between them.

When $$\kappa = 1$$ (that is, $$\mu = L$$), the sandwich is perfectly balanced: the same quadratic function bounds $$f$$ from above and from below. Since $$f$$ is squeezed between two identical parabolas, it must *be* that parabola. The sandwich collapses into an equality: for all $$x, y$$

$$
f(y) = f(x) + \langle \nabla f(x), y - x \rangle + \frac{\mu}{2}\|y - x\|^2
$$

The function is *exactly* its own second-order approximation everywhere — no error, no slack. Now evaluate this at the minimizer $$x^\star$$ where $$\nabla f(x^\star) = 0$$:

$$
f(y) = f(x^\star) + \frac{\mu}{2}\|y - x^\star\|^2
$$

So $$f$$ is a perfect quadratic bowl centered at $$x^\star$$. But we can squeeze out more. Differentiating the equality with respect to $$y$$ gives $$\nabla f(y) = \mu(y - x^\star)$$: the gradient at any point is just a rescaled vector pointing radially away from the minimizer. There is no zigzagging, no misalignment — gradient descent with step size $$1/\mu$$ reaches the minimum in exactly one step:

$$
y - \frac{1}{\mu}\nabla f(y) = y - (y - x^\star) = x^\star
$$

In other words, the only functions with a perfect sandwich are quadratics, and quadratics are the only functions where gradient descent doesn't need to iterate at all.

## [What goes wrong without one slice of bread](#what-goes-wrong)

### Without strong convexity

Set $$\mu = 0$$ and the lower bound degenerates into the tangent hyperplane — you lose the quadratic pull toward the minimum. The condition number $$\kappa = L/\mu$$ blows up to $$+\infty$$, which is the mathematical way of saying "gradient descent is going to have a bad time".

The secret sauce of strong convexity is that the gradient is guaranteed to change in an appreciable way at every step. For a $$\mu$$-strongly convex function, $$\|\nabla f(x)\|$$ grows at least proportionally to $$\|x - x^\star\|$$: a big gradient means you're far from the optimum, a small gradient means you're close. At every iterate, the gradient norm lets you prelude how close you are to the minimum — it's a *calibrated signal*. This has concrete algorithmic consequences: if you know roughly how far you are, you can take appropriately sized steps — large when far, small when close (assuming the field changes smoothly under your feet, which is what L-smoothness guarantees).

Without strong convexity, the gradient loses this calibration. Consider $$f(x) = \|x\|_1$$: the gradient is $$\pm 1$$ everywhere except the origin — it gives you the direction but says nothing about the distance. Whether you're at $$x = 100$$ or $$x = 0.001$$, the gradient screams with the same intensity. The gradient doesn't change at all as you move, so you have no way to gauge your progress. The same happens with the Huber loss: once you're in the linear regime, the gradient is constant and you can't tell if you're close or far. Without a gradient that scales with the distance, the solver is flying blind — it has no way to modulate its step size based on proximity to the minimum.

Even worse, without strong convexity you lose the guarantee that the minimizer is unique. The function might have a whole subspace of minimizers, or a flat region where the gradient vanishes but you're nowhere near the optimum.

<!-- DESMOS PLACEHOLDER
**Chart: gradient descent without strong convexity**

Run gradient descent on $$f(x_1, x_2) = \frac{1}{4}(x_1 + x_2)^4$$, which is not strongly convex. The Hessian is $$3(x_1+x_2)^2 \begin{pmatrix} 1 & 1 \\ 1 & 1 \end{pmatrix}$$, which has eigenvalues $$6(x_1+x_2)^2$$ and $$0$$. The zero eigenvalue corresponds to the direction $$(1, -1)$$ (the anti-diagonal): along this direction the function is completely flat. The curvature only exists along $$(1, 1)$$, and it vanishes on the line $$x_1 + x_2 = 0$$.

The gradient is $$\nabla f = ((x_1+x_2)^3,\; (x_1+x_2)^3)$$, so the update rule is:
- $$x_1^{(k+1)} = x_1^{(k)} - \eta \, (x_1^{(k)}+x_2^{(k)})^3$$
- $$x_2^{(k+1)} = x_2^{(k)} - \eta \, (x_1^{(k)}+x_2^{(k)})^3$$

Display:
- Contour lines of $$f$$ in the $$(x_1, x_2)$$ plane (these are parallel strips around the line $$x_1 + x_2 = 0$$)
- The iterates $$(x_1^{(k)}, x_2^{(k)})$$ as dots connected by line segments (e.g. 20-30 iterates)
- The line $$x_1 + x_2 = 0$$ (the set of minimizers) drawn as a dashed line

Sliders:
- $$\eta \in [0.01, 0.5]$$ (step size)
- Starting point draggable or $$(x_1^{(0)}, x_2^{(0)}) = (2, 1)$$

Key behavior: gradient descent moves only along the $$(1, 1)$$ direction (since both gradient components are always equal), approaching the line $$x_1 + x_2 = 0$$ but never sliding along it. The convergence slows down dramatically near the line of minimizers because the curvature vanishes there — the gradient $$(x_1+x_2)^3$$ shrinks cubically. The algorithm converges to $$(\frac{1}{2}, -\frac{1}{2})$$ (the projection of the starting point onto the minimizer line), but the last few iterates barely move. This is the flat direction pathology: no curvature along the kernel direction, and vanishing curvature near the minimizers.
-->

<!-- DESMOS PLACEHOLDER
**Chart: pathology — missing strong convexity (1D)**

Plot $$f(x) = \frac{1}{100}x^4$$:
- The function $$f(x)$$ in bold (red)
- Its first-order approximation at $$a$$: $$\ell_a(x) = f(a) + f'(a)(x - a)$$ (gray dashed), where $$f'(x) = \frac{4}{100}x^3$$
- Attempted strong convexity lower bound: $$q^-_a(x) = f(a) + f'(a)(x-a) + \frac{\mu}{2}(x-a)^2$$ (blue)

Sliders:
- $$a \in [-3,3]$$ (tangent point)
- $$\mu \in [0.01, 1]$$ (attempted strong convexity parameter)

Key behavior: no matter what $$\mu$$ you pick, the blue parabola will eventually poke above the red curve near the origin (where the function is extremely flat). There is no global $$\mu > 0$$ that works.
-->

{% include desmos.html
   src="https://www.desmos.com/calculator/uwwlpwydjf?embed"
   height="500" %}

<!-- {% include desmos.html
   src="https://www.desmos.com/3d/arumbpubx6?lang=it"
   height="800" %} -->

### Without L-smoothness

Imagine you're kicking a ball blindly toward a target — you can't see the field, but someone tells you the direction to kick. As long as you're kicking in the mud, life is predictable: the ball moves a little bit each time, the friction keeps things under control, and you can reasonably expect where it will land after each kick. You make steady progress, kick after kick. But now imagine the mud suddenly disappears and you're on ice. You kick with the same energy as before, but this time the ball flies away — it overshoots the target and lands even further from it than where you started. The ground changed under your feet, but your kicking force didn't adapt.

That's the core problem without L-smoothness: you find a step size that works well in one region (where the gradient is moderate, the "mud"), you proceed confidently, but you end up in a region where the gradient has exploded (the "ice") — the change in the gradient was way bigger than the change in the input. Using the same step size now produces a catastrophic overshoot, and you might end up further from the minimum than where you began.

Mathematically: remove the upper bound and the function is free to spike arbitrarily. A solver that takes a step based on the current gradient has no guarantee about what the function value will be at the new point — it could be much higher than expected because the curvature exploded between the current point and the next.

Consider $$f(x) = -\ln(x)$$ for $$x > 0$$: the second derivative is $$\frac{1}{x^2}$$, which is unbounded as $$x \to 0$$. Far from the origin the function is gentle (at $$x = 10$$, the curvature is just $$0.01$$), but near the origin the curvature explodes (at $$x = 0.1$$, the curvature is $$100$$). A step size calibrated for the gentle region will massively overshoot if it carries you into the steep region, and a step size conservative enough for the steep region will crawl everywhere else.

In the extreme case of a non-differentiable function like $$f(x) = \|x\|$$, the gradient changes instantaneously at the kink — the effective $$L$$ is infinite at that point. Standard gradient descent simply cannot handle this without modification.


<!-- DESMOS PLACEHOLDER
**Chart: pathology — missing L-smoothness**

Plot $$f(x) = x^4$$:
- The function $$f(x)$$ in bold (red)
- Its first-order approximation at $$a$$: $$\ell_a(x) = f(a) + f'(a)(x - a)$$ (gray dashed), where $$f'(x) = 4x^3$$
- Attempted L-smoothness upper bound: $$Q^+_a(x) = f(a) + f'(a)(x-a) + \frac{L}{2}(x-a)^2$$ (green)

Sliders:
- $$a \in [-3,3]$$ (tangent point)
- $$L \in [1, 50]$$ (attempted smoothness parameter)

Key behavior: for any fixed $$L$$, move the tangent point $$a$$ far from the origin and the green parabola will fail to stay above the red curve. The function always escapes the upper bound eventually. No finite $$L$$ works globally.
-->

{% include desmos.html
   src="https://www.desmos.com/calculator/knzwn4w2tk?embed"
   height="500" %}

### Both properties are important
In fact, this is the right lens to understand both properties together: **strong convexity is about how rich the local information is** along the optimization path — it ensures the gradient changes meaningfully at every iterate, dense with useful signal about your position. **L-smoothness is about how reliable that local information is** — it ensures the landscape doesn't change too abruptly, so that trusting the local gradient for a step won't land you somewhere unexpected. A well-conditioned problem has both: abundant and trustworthy local information.


## [The spectral perspective — reading the Hessian's eigenvalues](#spectral-perspective)

If $$f$$ is twice differentiable, everything we've discussed can be read off from the Hessian $$\nabla^2 f(x)$$. Since $$f$$ is convex, the Hessian is positive semidefinite at every point, meaning all its eigenvalues are non-negative

$$
0 \leq \lambda_1(x) \leq \lambda_2(x) \leq \cdots \leq \lambda_n(x)
$$

Each eigenvalue $$\lambda_i(x)$$ is paired with an eigenvector $$v_i(x)$$ — a direction in $$\mathbb{R}^n$$ along which the Hessian acts by simple scaling: $$\nabla^2 f(x) \, v_i(x) = \lambda_i(x) \, v_i(x)$$. If you stand at $$x$$ and take a small step of size $$\varepsilon$$ along $$v_i$$, the second-order Taylor expansion gives

So if you move along the eigenvector $$v_i$$, the Hessian's contribution to the change in $$f$$ is governed by $$\lambda_i(x)$$: a large eigenvalue means the function bends sharply in that direction, a small one means it's nearly flat. The eigenvectors define a set of "natural axes" at each point, and the eigenvalues tell you the curvature along each of these axes.

### Strong convexity through the spectrum

Strong convexity means the smallest eigenvalue is bounded away from zero everywhere:

$$
\lambda_1(x) \geq \mu > 0 \quad \forall \; x
$$

If a single eigenvalue touches zero at some point, you've lost curvature in that direction — the function has a "flat direction" at that point, and strong convexity fails. The parameter $$\mu$$ is the tightest such bound: $$\mu = \inf_x \lambda_1(x)$$. When $$\mu = 0$$, the quadratic lower bound from the sandwich degenerates into the tangent hyperplane: you can no longer guarantee that the function grows away from any point, which means the minimizer might not be unique (or might not exist at all). Looking back at the Taylor expansion, if $$\lambda_i(x) \approx 0$$ the second-order term $$\frac{\lambda_i}{2}\varepsilon^2$$ essentially vanishes: moving along $$v_i$$ barely changes the function's value, so the landscape is nearly flat in that direction. For gradient descent, this means the gradient carries almost no information about how to move along $$v_i$$ — you're essentially blind in that direction. In the extreme case where $$\lambda_i(x) = 0$$, we have $$\nabla^2 f(x) \, v_i = 0$$, meaning $$v_i$$ belongs to the kernel of the Hessian. The dimension of $$\ker(\nabla^2 f(x))$$ tells you how many independent directions are completely "dead" at $$x$$ — no curvature at all. A one-dimensional kernel is a single flat direction; a large kernel means the function is degenerate in many directions simultaneously. So inspecting the kernel of the Hessian gives you a direct measure of how severely strong convexity is violated at a given point.

### L-smoothness through the spectrum

L-smoothness means the largest eigenvalue is bounded above everywhere:

$$
\lambda_n(x) \leq L \quad \forall \; x
$$

The parameter $$L$$ is the tightest such bound: $$L = \sup_x \lambda_n(x)$$. When this bound fails — that is, when $$\lambda_n(x)$$ is unbounded — there is no finite $$L$$ and the function is not smooth.

To see what this means concretely, go back to the Taylor expansion. The second-order term along the eigenvector $$v_n$$ associated with the largest eigenvalue is $$\frac{\lambda_n(x)}{2}\varepsilon^2$$. If $$\lambda_n(x)$$ is huge, even a tiny step $$\varepsilon$$ along $$v_n$$ causes a massive change in function value — the landscape is extremely steep in that direction. A solver that picks a step size calibrated for the gentler directions will wildly overshoot along $$v_n$$.

But the real problem is when $$\lambda_n(x)$$ is not just large but *varies dramatically across the domain*. Consider $$f(x) = x^4$$: the second derivative is $$12x^2$$, which is nearly zero near the origin but explodes as $$\|x\|$$ grows. At $$x = 0$$ the Hessian says "the function is flat, take a big step"; at $$x = 10$$ the Hessian says "the function is curving at rate 1200, tread carefully". No single $$L$$ can faithfully describe this function's curvature everywhere, and a solver that trusts a global step size $$1/L$$ is either being reckless (if $$L$$ is too small) or excessively timid (if $$L$$ is set to accommodate the worst case).

In the most extreme scenario, if at some point $$x$$ the eigenvalue $$\lambda_n(x) \to \infty$$, the quadratic upper bound from the sandwich becomes vacuous: no finite parabola can cap the function from above. The descent lemma breaks down and the solver has no reliable model of what happens after a step — much like kicking the ball on ice, the solver has no idea where it will land.

Zooming out, recall that applying the Hessian to an eigenvector simply returns the same eigenvector rescaled by the corresponding eigenvalue: $$\nabla^2 f(x) \, v_i = \lambda_i(x) \, v_i$$. The eigenvalue is the rescaling factor. Now, $$\mu$$ and $$L$$ define the bounds of the spectrum: all eigenvalues of $$\nabla^2 f(x)$$ at every point $$x$$ must live in the interval $$[\mu, L]$$, meaning all these rescaling factors are confined to this range. The spread of this interval — ultimately captured by $$\kappa = L/\mu$$ — tells you how much variability there is in how the Hessian rescales different directions.

When $$\kappa$$ is close to 1, the interval $$[\mu, L]$$ is tight: every eigenvector gets approximately the same rescaling when multiplied by the Hessian (because the eigenvalues are all similiar). Applying a generic vector $$d$$ to the Hessian produces a result whose magnitude is predictable — it doesn't matter much which direction $$d$$ points, because all directions are treated nearly equally. The Hessian ellipsoid $$\{d : d^\top \nabla^2 f(x) \, d \leq 1\}$$ is nearly spherical, and gradient descent behaves well.

When $$\kappa$$ is large, the interval $$[\mu, L]$$ is wide: different eigenvectors can receive wildly different rescalings. A direction aligned with the eigenvector of $$\lambda_n$$ gets amplified by $$L$$, while a direction aligned with $$\lambda_1$$ barely gets scaled at all. Any generic direction — which is typically a mix of eigenvectors — will have its components stretched by very different factors. The Hessian's action becomes highly anisotropic: the outcome of applying a vector to it depends dramatically on where that vector points. The ellipsoid is elongated, and gradient descent zigzags because the gradient (which is the Hessian applied to the displacement from the optimum) systematically misrepresents the true direction to the minimum.

For a concrete example, consider a quadratic $$f(x) = \frac{1}{2} x^\top H x$$ where $$H = \text{diag}(\mu, L)$$. The Hessian is $$H$$ everywhere, so the ellipsoid has semi-axes of length $$1/\sqrt{\mu}$$ and $$1/\sqrt{L}$$, and the eccentricity ratio is $$\sqrt{\kappa}$$.


{% include desmos.html
   src="https://www.desmos.com/calculator/jfw2uvz8kg?embed"
   height="500" %}

<iframe src="/assets/interactive/gradient_descent_zigzag.html" width="100%" height="650" style="border:none;"></iframe>


## [The verification trick](#verification-trick)

Computing eigenvalues of the Hessian in closed form is not always feasible. Luckily, there is an elegant shortcut for checking both L-smoothness and strong convexity that reduces the question to plain convexity — which is often easier to verify.

**Claim.** $$f$$ is $$L$$-smooth if and only if the function

$$
g(x) = \frac{L}{2}\|x\|^2 - f(x)
$$

is convex.

**Why it works.** If $$f$$ is twice differentiable, the Hessian of $$g$$ is

$$
\nabla^2 g(x) = LI - \nabla^2 f(x)
$$

This matrix is PSD if and only if every eigenvalue of $$\nabla^2 f(x)$$ is at most $$L$$, which is exactly the spectral condition for L-smoothness. So checking "is $$g$$ convex?" is the same as checking "are all Hessian eigenvalues of $$f$$ bounded by $$L$$?".

Symmetrically, $$f$$ is $$\mu$$-strongly convex if and only if

$$
h(x) = f(x) - \frac{\mu}{2}\|x\|^2
$$

is convex. The Hessian of $$h$$ is $$\nabla^2 f(x) - \mu I$$, which is PSD if and only if every eigenvalue of $$\nabla^2 f(x)$$ is at least $$\mu$$.

Check the chart below: the two helper functions become convex only when $$\mu \leq 1$$ and when $$L\geq 3$$

{% include desmos.html
   src="https://www.desmos.com/calculator/x3yzcddnb8?embed"
   height="500" %}

## [Wrapping up](#wrapping-up)

Here is what we covered:
- **Strong convexity** guarantees a quadratic lower bound: the function curves away from its tangent with minimum curvature $$\mu$$
- **L-smoothness** guarantees a quadratic upper bound: the function can't curve faster than $$L$$
- Together they produce the **quadratic sandwich**, controlled by the condition number $$\kappa = L/\mu$$, which proxies the relative distance betweenn the quadratic gaps of the two bounds
- At the **spectral level**, these properties correspond to global bounds on the Hessian eigenvalues: $$\mu \leq \lambda_i(x) \leq L$$
- The **verification trick** reduces checking these properties to plain convexity of a modified function

These two properties are among the most important structural assumptions in optimization theory. They are the reason gradient descent works well on some problems and terribly on others, and the condition number $$\kappa$$ is the single number that best summarizes the difficulty of a smooth convex problem.

But there is a deeper story lurking here. Strong convexity and L-smoothness are not independent concepts — they are *dual* to each other in a precise sense involving the Fenchel conjugate. If that rings a bell from [a previous post]({% post_url 2025-07-4-fenchel %}), stay tuned.

In the meantime, remember: a well-balanced sandwich is the key to a healthy life — whether it's made of quadratics or whole grain bread. Eat well, optimize well.



## [Appendix: from Lipschitz gradients to the descent lemma](#appendix-descent-lemma)

We want to show that if $$\nabla f$$ is $$L$$-Lipschitz, then for all $$x, y$$

$$
f(y) \leq f(x) + \langle \nabla f(x), y - x \rangle + \frac{L}{2}\|y - x\|^2
$$

The idea is beautifully simple: instead of reasoning about $$f$$ in its full $$n$$-dimensional glory, we restrict our attention to the straight line connecting $$x$$ and $$y$$. Imagine walking from $$x$$ to $$y$$ in a straight line: the parameter $$t \in [0,1]$$ describes how far along the walk you are. At $$t=0$$ you are standing at $$x$$, at $$t=1$$ you have reached $$y$$, and at any intermediate $$t$$ you are at the point

$$
\gamma(t) = x + t(y - x)
$$

which is just the convex combination $$(1-t)x + ty$$. Now define $$\phi(t) = f(\gamma(t))$$: this is the "view from the path", the function $$f$$ restricted to the segment $$[x, y]$$ and re-parametrized as a function of a single scalar $$t$$. In other words, we have collapsed a potentially high-dimensional problem into a one-dimensional one, which is much easier to reason about.

Since $$\phi$$ is just $$f$$ along a line, its derivative tells us how $$f$$ changes as we walk. By the chain rule

$$
\phi'(t) = \langle \nabla f(\gamma(t)),\; y - x \rangle
$$

By the fundamental theorem of calculus

$$
f(y) - f(x) = \phi(1) - \phi(0) = \int_0^1 \langle \nabla f(\gamma(t)),\; y - x \rangle \, dt
$$

Now we add and subtract $$\nabla f(x)$$ inside the inner product:

$$
f(y) - f(x) = \int_0^1 \langle \nabla f(x),\; y - x \rangle \, dt + \int_0^1 \langle \nabla f(\gamma(t)) - \nabla f(x),\; y - x \rangle \, dt
$$

The first integral is constant in $$t$$, so it evaluates to $$\langle \nabla f(x), y - x \rangle$$. For the second integral, we apply Cauchy-Schwarz:

$$
\langle \nabla f(\gamma(t)) - \nabla f(x),\; y - x \rangle \leq \|\nabla f(\gamma(t)) - \nabla f(x)\| \cdot \|y - x\|
$$

Now we use the Lipschitz condition on the gradient. Since $$\gamma(t) - x = t(y - x)$$:

$$
\|\nabla f(\gamma(t)) - \nabla f(x)\| \leq L\|\gamma(t) - x\| = Lt\|y - x\|
$$

Substituting back into the integral:

$$
\int_0^1 \langle \nabla f(\gamma(t)) - \nabla f(x),\; y - x \rangle \, dt \leq \int_0^1 Lt\|y - x\|^2 \, dt = \frac{L}{2}\|y - x\|^2
$$

Putting it all together:

$$
f(y) - f(x) \leq \langle \nabla f(x),\; y - x \rangle + \frac{L}{2}\|y - x\|^2
$$

which is exactly the descent lemma. $$\square$$

Notice that this proof did not require convexity of $$f$$ — only differentiability and the Lipschitz condition on the gradient. Convexity gives you the reverse direction (the descent lemma implies Lipschitz gradients for convex functions), making the two characterizations equivalent in the convex setting.

---