---

share: true
layout: post
title: "Fork your conversations and rebase your prompts"
category: cs
---

One of the skillsets that the AI phenomenon has quietly boosted is the capability of **explaining yourself**: putting into words what you actually want, and providing methodologies that can unambiguously verify the implementation against your expectations. Turns out that if you can't describe your intent in a way that survives a stranger reading it cold, the agent can't either. The good news is that this skill compounds. The bad news is that most of us discover we suck at it the first time we type a prompt and the agent produces something that sounds aligned with your intent, but is fragile and full of disliked side effects.

## Your prompt is a lossy encoding of your intent

The agent's job, stripped to its bones, is to infer your intent from very limited sources. Your intent is the real message: rich, fuzzy, packed with implicit context you take for granted. **Your prompt is just its encoding**, and it is almost always a lossy compression of that intent. You, as the user, are also the encoder of this message, and that means you carry the responsibility of encoding it properly to increase the chances of an accurate decoding on the other side. Nobody else is going to do this job for you, and the agent certainly can't read your mind no matter how many parameters it has.

By default, most agents try to amplify the signal of your prompt by evaluating contextual information around it: the folder you are currently working on, the previous messages exchanged, system prompts, user-defined skills and rules. When this contextual scaffolding is solid and your prompt has high quality, the amplification works in your favor and the agent reconstructs something close to your original intent. When it isn't, things fall apart in spectacular ways: if the surrounding context is low quality, and/or your prompt is noisy due to vagueness and contradictions, what gets amplified is **noise**. The output is then the canonical AI slop: confident, plausible-looking, and structurally wrong.

The upshot is that agentic engineering requires actual effort to safeguard the quality of prompts and contextual information, and this is not as easy as it might sound. There are a lot of blind spots and missing pre-requisites for an external listener hearing your idea for the first time, and you, while pitching your intent, might genuinely fail to guess all of the information that is missing on the other side. **You can't audit something you don't know is missing**. Typically, this gap is handled naturally during the conversation thread, but only on one condition: that the agent is proactively encouraged to be opinionated about your ideas and to raise questions when it feels unsure. Without that nudge, it will happily fill the void with plausible guesses, and you will only notice once the implementation is already on fire.

#### Ask for agent feedback
When you are encoding your message (i.e. writing your prompt) you are inevitably estimating which information the agent will need in order to decode it, but your estimate can fail in exhaustivity. So asking the agent for feedback on how confident it is in understanding your intent is essentially asking for a **residual**: the gap between what you transmitted and what the agent actually needed. That residual is valuable information for you, because it tells you exactly where your encoding leaks, and it is typically used in follow-up messages to clarify your intentions and patch the missing bits.

#### The problem of clarifying your intent with multiple prompts

This approach is very workable, but it has a cost. Your message (your intent) ends up diluted across multiple lossy encodings (multiple messages), and while effective, this is quite inefficient because it erodes a fundamental budget constraint in agentic engineering: the **context window**. After a long conversation thread the agent will start context-rotting, and this will probably kill the quality of the agentic contribution. Worse, encoding your intent across multiple prompts also lowers the quality of the contextual information that the agent will lean on in the future, when it tries to amplify the signal from the next messages: the past noise is now part of the surrounding context. The takeaway is that **high-quality prompts generate positive externalities both for the current implementation and for the related follow-ups down the line**.

## Don't reply, rewind: fork your conversation

In order to mitigate this, I started doing a stupid-simple thing that improved the quality of agentic contributions a lot. I just append the following at the end of my prompt:

> Before starting the conversation, return your confidence level in the assignment understanding. If it is below 100%, tell me which clarifications you need (if any) and if you have divergent ideas (if any) be opinionated about it, otherwise start the implementation.

I noticed that the agent will typically answer that it is ~75/80% sure most of the time. While this is obviously a hand-wavy heuristic (what makes a confidence level 70% vs 80%, really?), it forces the agent to stop and focus on the questions that, if left unanswered, would simply get interpreted on the fly. It is like the agent self-prompting the important assignment requirements during its chain of thought, since amplifying the signal of your prompt is the only tool it has when you haven't given it enough.

Here is where it gets fun. The deprecated conversation gives you a **preview** of how the agent would reason on the task, and the answers it produces are exactly the questions it would otherwise have answered in its own head to sketch an acceptable solution. Given this preview, you can roll back in time by **forking your conversation at your poorly-prompted message**, fix the prompt with the answers to the questions the agent would have asked itself in the chain of thought, and iterate.

Then, depending on the answer, I would fork the existing conversation (so that I don't lose the previous information-rich context) and **rebase my prompt** by answering the questions raised in the previous thread. Then I ask again for feedback on how confident the agent is in understanding the assignment. Hopefully, it now understands more, and the new questions/doubts it raises are more detailed, which in turn forces you to be aware and opinionated about specific design decisions you had been hand-waving about. After a couple of iterations, you end up with a high-quality prompt that condenses multiple feedback sessions with the agent into a single message, and this tremendously improves the quality of the agentic contribution.


![fork and rebase](2026-05-24-fork-your-conversations-and-rebase-your-prompts)


It is quite satisfying to see how, as your prompting skills improve, the agent's questions get refined and more specific around the actual implementation of your idea. By forking your conversation again and again, your **latest fork becomes an extremely high-signal thread of messages**: the context window gets extremely optimized, and your cognitive debt on the project gets mitigated as well, since you are forced to pick real implementation decisions in order to resolve the agent's doubts about your intent.

The cool thing is that you can deep-dive on the reasons why the agent has certain doubts or is opinionated about a certain approach: indeed, that new information will be used in the forked conversation rolled back to the original message. You can deep-dive as much as you want while requesting feedback, since the conversation will be trashed in favor of the forked version anyway.

#### Cognitive debt mitigation

Moreover, this forces you to proactively think about your implementation and follow along while the code is being generated. This is extremely valuable because it also mitigates the amount of cognitive debt you are borrowing while delegating code generation to the agent. **Cognitive surrender** is, in my opinion, one of the most insidious poisons for your project, and it is extremely important to actively avoid it.

#### The acceptable catch

Of course, this comes with a price tag. **You are trading context-window savings for an actual economic cost**, because you are generating output tokens just to reinforce your own prompt. On top of that, **you are spending a non-trivial amount of time "writing English"**, and some people will feel discouraged or get bored quite soon. In my personal experience, and according to my working methodology, I was always happy to pay this trade-off: I found that otherwise the amount of cognitive debt I would collect after an agentic contribution was too high, and I would surrender to AI slop very quickly. I'd rather spend more for a nice contribution than spend slightly less for a miserable one.

## Closing thoughts: Agentic engineering vs vibe coding

I think this is what really distinguishes agentic engineering from vibe coding: the involvement and the awareness of the programmer regarding the architectural and practical decisions about the implementation of their intents. 

A lazy programmer or a novice will happily borrow cognitive debt to get a quick implementation of their idea while abstracting away the implementation plan entirely, because they are probably chasing a rapid dopamine spike or some feedback about the idea they had in mind: they are not really looking for active engagement with the agent, and they delegate a lot of agency to it regarding the implementation plan, even when this implies immediate or near-future cognitive surrender.

In the context of agentic engineering, instead, this active involvement is what makes the agent a true tool that boosts the user's skillset, while the user stays in charge of the architectural and implementational decisions of the project. As the user is forced to clarify her own intents, she will probably need to face new domains, and this makes her **hungry** for new information. The cool thing is that you can deep-dive on the reasons why the agent has certain doubts or is opinionated about a certain approach: that new information will be used in the forked conversation rolled back to the original message, and you can deep-dive as much as you want while requesting feedback, since the conversation will be trashed in favor of the forked version anyway.

#### Save your boosted prompts

One last habit I would recommend: save each "boosted" prompt. As your project grows, you will collect multiple rich encodings of your intents, and this collection of high-quality prompts might be extremely valuable down the road. Some people even argue that the source code of the future will be equivalent to boosted prompts with a certain structure, so that they can be "compiled" by the agent decoding them, and any coding agent would then be capable of replicating that project most of the time in a programming-language-agnostic fashion. Whether or not you buy that prophecy (probably I am not buyig it to this extent), a `prompts/` folder full of well-crafted intents is, at the very minimum, the cleanest documentation of *why* your project looks the way it does, and might give you a future reference to recall some architectural decisions you made. 





