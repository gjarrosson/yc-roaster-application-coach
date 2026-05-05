# Common Mistakes — What Gets YC Applications Rejected

Source: distilled from YC Roaster's production evaluation rubrics (`src/lib/ai-judge.ts`). These are the penalty signals that score poorly across all 7 dimensions.

---

## The master list

### 1. "We believe X" without evidence

This phrase and its variants ("we think," "we feel," "we expect") are assertion disguised as insight. They appear constantly in weak applications.

Bad: "We believe the market is ready for this solution."
Bad: "We think customers will prefer our approach."

The fix is always the same: replace the belief with the evidence that produced it. If there's no evidence, that's the real problem.

---

### 2. Top-down TAM without bottom-up math

"The X market is worth $50B" is not a market analysis. It's a number from a report. YC wants to know how much of what market you can reach with your specific product, priced at your specific price, sold to your specific buyer.

Bad: "The global supply chain market is $19.3T."
Better: "There are 80,000 mid-market manufacturers in the US. 20% have the pain we solve. At $12K ACV, our reachable market is ~$190M."

---

### 3. Vanity metrics without usage context

Numbers without denominators and context mislead, and experienced reviewers know it.

Bad: "10,000 users" (out of how many signups? what do they do? how often?)
Bad: "1 million impressions" (from an ad campaign, irrelevant)
Bad: "2,000 waitlist signups" (conversion to active users?)

The denominator and retention curve matter as much as the top-line number.

---

### 4. Revenue projections presented as traction

Future projections are not evidence of current demand. They are a model, and models are assumptions. Listing projected revenue to a reviewer who is looking for proof of demand reads as: "we have no real traction."

Bad: "We expect to reach $1M ARR by end of year."
Better: "We're at $8K MRR with 15% MoM growth. At that rate we'd reach $100K MRR in 18 months."

---

### 5. One-off anecdotes substituted for patterns

A single Fortune 500 company "expressing interest" is not a signal. Neither is one customer who loves the product. YC is looking for repeatable, pattern-forming behavior across multiple independent buyers or users.

Bad: "A VP at Google told us this is exactly what they need."
Better: "We have 6 active design partners, 2 of whom have already agreed to convert to paid at $2K/month when we GA."

---

### 6. "We have no competitors"

This is almost never true, and it signals poor market research. Every product competes with something — at minimum, it competes with doing nothing or using a spreadsheet. Saying "no competitors" makes a reviewer wonder what else you're missing about the market.

The fix: name the real competitors (including indirect substitutes), then explain your specific insight advantage.

---

### 7. Founders with credentials but no proof of building

A team of MBAs and consultants with impressive resumes who have never shipped a product is a risk pattern. YC bets on builders. Credentials establish context; they don't establish execution capability.

Bad: "Our team has 40+ years of combined experience in [industry]."
Better: "Our CTO built [Product X], which reached [Y] users before we pivoted to this. Our CEO spent 5 years as a [role] at [company], which is how we know this problem exists."

---

### 8. Part-time founders with no commitment plan

Founders who haven't left their jobs to build this product are a signal of low conviction or high opportunity cost. YC moves fast and expects founders to be all-in.

Bad: "We've been working on this nights and weekends for 2 years."
Better: "We both went full-time 3 months ago. [Founder] left [job], [co-founder] left [job]. We have 18 months of runway."

---

### 9. GTM plan = "we will do ads / go viral / hire sales later"

This pattern appears in almost every weak application. It is not a go-to-market strategy.

Bad: "We plan to acquire users through paid ads, SEO, and social media."
Bad: "Our product will grow through word of mouth."
Bad: "Once we raise our Series A, we'll hire a sales team."

Better: "Our first 20 customers came from [specific channel]. The conversion from [top of funnel] to paid is [X]%. We've identified [specific next channel] as repeatable because [specific reason]."

---

### 10. Services disguised as software

A product that requires significant founder or employee time to deliver its value is a service business, not a software business — even if there's a dashboard involved. YC invests in software businesses.

Warning signs:
- "We handle the [core task] for customers manually while we build automation"
- No clear automation roadmap
- Gross margin under 40% at current scale
- Every new customer requires a custom implementation

---

### 11. Moat claims without mechanism

"Our moat is our data" or "our competitive advantage is our proprietary AI" requires explanation of the mechanism. How does more data make the product better in a way competitors can't replicate? What specifically is proprietary about the AI?

Bad: "Our data moat means competitors can't catch up."
Better: "Every customer's data trains a personalized model for that customer. Competitors starting today would need 2+ years of customer data to match our recommendation accuracy on new accounts."

---

### 12. Founder-market fit asserted without demonstration

"We are uniquely positioned to solve this problem" is a claim, not evidence. The evidence is the story of how you came to know this problem better than anyone else.

Bad: "We have deep domain expertise in logistics."
Better: "I spent 4 years as a dispatcher at a regional trucking company. I built the manual process that this software replaces. I know every edge case."

---

### 13. "We plan to" when the question asks what you've done

A large number of YC application answers substitute future plans for present reality. This is especially common in the progress and traction sections. The question "how far along are you?" is asking about the present, not the roadmap.

Bad: "We plan to launch in Q3 and onboard our first paying customers by Q4."
Better: "We launched in March. We have 3 paying customers at $500/month. We shipped [feature] last week."

---

### 14. The long answer that doesn't answer the question

Word count is not a substitute for substance. An answer that runs 500 words but never directly addresses what YC asked scores worse than a 100-word answer that is precise and specific. Reviewers flag long non-answers as a sign of fuzzy thinking.

The test: underline the sentence in your answer that directly answers the question. If you can't find one, rewrite.
