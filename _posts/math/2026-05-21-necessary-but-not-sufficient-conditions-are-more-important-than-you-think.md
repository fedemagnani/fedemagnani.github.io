---
share: true
layout: post
title: Necessary but not sufficient conditions are more important than you think
category: math
---
Most of the time when I was reading propositions/theorems/corollaries stating necessary-but-not-sufficient conditions I used to feel almost defrauded: _you're selling me something that sounds useful but actually tells me nothing about the statement I'm trying to prove, since on its own it isn't enough to prove it._

What I'd been missing, though, were several use-cases where knowing a necessary-but-not-sufficient condition can save you:

- As a **circuit breaker** in your proof:
    - if "N is necessary for P (but may not be sufficient)", then the moment you realize in your proof that `N==false`, you can safely exit early and conclude `P==false`.
    - if instead `N==true`, you still can't conclude anything about `P` (hence my original frustration).
    - Under this use case, the necessary-but-not-sufficient condition is extremely useful, paradoxically, when you can prove that it is not satisfied and terribly useless when it is verified

- For **piggy-backing** additional properties or statements:
    - Suppose that, whether from your proof's initial assumptions or from something derived along the way, you observe `P==true`: trivially, every condition required for `P` to exist must hold, otherwise `P` couldn't exist in the first place.
    - Consequently, if any prop/theorem/proof states "N is a necessary condition for P (but may not be sufficient)", then `P==true` hands you `N==true` for free.
    - This is also what the notation `P => N` really means: if `N` is a necessary (but perhaps not sufficient) condition for `P`, then `P` is a sufficient (but perhaps not necessary) condition for `N`.
    - However, if your aim is to get `N` for free but `P==false`, then you still can't say anything about `N`.
    - In contrast to the previous case, here the necessary-but-not-sufficient condition is incredibly useful (and generous) whenever it applies because of the existence itself of `P`, and completely useless when `P==false`