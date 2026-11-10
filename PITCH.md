# Teeka: a vaccine against scam calls

**Practice scam calls for parents and grandparents, in their own language, that stop and teach the moment they start to fall for one.**

**Team:** Satvik Pandey (Team Leader) and Malhar Srivatsav
**College:** Manipal Institute of Technology, Bengaluru

## The problem

India registered 21,900+ digital-arrest complaints involving ₹647 crore+ from January to August 2026 (I4C and MHA status report to the Supreme Court, reported October 2026). Older people are among the easiest targets. Spam apps only flag known numbers, posters only tell people what to do, and bank checks act after the person is already convinced. Nobody practises saying no under pressure.

## The solution

A family member starts a practice call from a website. The older person's phone rings with a fictional caller, and a Gnani voice runs a realistic but fake scam.

- **If they start to share** an OTP or agree to pay, the call stops at once and a calm voice explains the red flag they missed.
- **If they refuse**, they earn a Protected stamp.
- **Every call** goes on a Teeka card and schedules the next dose: a booster in 3 days after a miss, the next scam in 7 days after a pass.

## Why it's different

Teeka doesn't try to detect scams. It builds the skill of saying no. The caller answers real questions such as "which app?" or "how much?", and a rule-based check stops the call before anything else runs. Families can measure progress through an immunity score, red flags missed, and time to refuse.

## Built on Gnani AI

| Model | Job in Teeka |
|---|---|
| **Prisma** (speech to text) | Hears replies over a realtime stream, with a mic gate so the caller's own voice is never transcribed |
| **Timbre** (text to speech) | Speaks the scammer and the teacher |

15 scam types and packs for 10 Indian languages are data files, so adding one needs no code. Optional hooks exist for Gnani voice cloning and Evon.

## Proof so far

Full Hindi calls work on a real Android phone. Our test calls show a median Prisma latency of 124 ms. In synthetic tests, Prisma got 20 of 20 replies right, including with added noise at 10 dB. Automated tests cover the safety rules, privacy, and every scam in every language. Language packs still need native-speaker review, and calls currently run in a browser page.

## Safe by design

Consent comes first. Only fictional organisations are used, never police or courts. Digits are masked and only outcomes are saved. A call ends kindly if someone is upset.

## Who pays

Banks and fintechs, per completed drill, on the outbound calling they already buy. Next steps are real phone-network calls, native-speaker review, and a 1,000-customer bank pilot measuring pass rates from dose 1 to dose 3.

**Code:** https://github.com/ParthavSatvik/teeka

*Role-played demo. All names, numbers and organisations are fictional.*
