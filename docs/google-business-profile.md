# Google Business Profile — DNR Techno Services

The website side of local SEO is now done in code (see `lib/seo.ts` → `buildLocalBusinessJsonLd`).
The listing side has to be done by an owner signed in to the Business Profile, because it needs
account access this repo does not have.

Work through this in order. Steps 1–3 are what actually move local rankings.

## The NAP that everything must match

Google matches a website to a Business Profile partly by comparing the name, address and phone.
Every surface — the listing, the website footer, the contact page, the schema, IndiaMART, JustDial,
Facebook — must use these **character for character**:

| Field   | Value |
| ------- | ----- |
| Name    | DNR Techno Services |
| Address | Office No. 820, 8th Floor, Laxmideep Building, Laxmi Nagar District Centre, Laxmi Nagar, Delhi 110092 |
| Phone   | +91 99113 99919 |
| Email   | info@dnrtechnoservices.com |
| Website | https://dnrtechnoservices.com |

Pick one phone number as the listing's primary and use the same one everywhere. The site currently
publishes two (+91 9911399919 and +91 9711196735); the second belongs in the listing's
*additional phones* field, not as a second primary.

## 1. Claim or verify the listing

1. Sign in at <https://business.google.com> with the account that owns the listing.
2. Search "DNR Techno Services Laxmi Nagar". If a listing exists but is not claimed, claim it.
   If two listings exist for the same office, request removal of the duplicate — duplicates split
   ranking signals and are a common cause of a business not appearing in the map pack.
3. Complete verification. Until the listing is verified it will not rank in the local pack.

## 2. Fill the listing completely

Google favours complete profiles. Fill every one of these:

- **Primary category:** the closest match to the core business, e.g. *Machine shop*,
  *Industrial equipment supplier*, or *Machinery parts manufacturer*. Pick one and keep it.
- **Additional categories:** e.g. *Die casting machine supplier*, *Engineering consultant*.
- **Service area:** the states already configured in the CMS coverage map. These are now also
  emitted as `areaServed` in the site's schema, so the two agree.
- **Hours:** real opening hours, including a closed day if there is one.
- **Business description:** 750 characters, written for buyers, no keyword stuffing.
- **Opening date.**
- **Products / services:** add the machine categories that have pages on the site, and link each
  one to its page, e.g. <https://dnrtechnoservices.com/products/cold-chamber-die-casting-machine>.
- **Photos:** real photos of the office, team, and installed machines. Listings with photos get
  materially more calls and direction requests. Add new ones regularly.
- **Attributes:** whatever genuinely applies (on-site services, online estimates).

## 3. Feed the three values back into the website

Once the listing is live, copy three things from it into **Admin → Settings → Google Business
Profile & local SEO**, then save:

| Admin field | Where to get it |
| ----------- | --------------- |
| Google Business Profile URL | Listing → Share → the `https://maps.app.goo.gl/...` short link |
| Latitude / Longitude | Open the listing in Google Maps, right-click the pin, click the coordinates to copy |
| Map link | The same Maps link; fills `hasMap` in the schema |

Also add every profile the business genuinely owns under **Profile links (sameAs)** — LinkedIn,
Facebook, YouTube, IndiaMART, JustDial. `sameAs` is one of the signals Google uses to confirm the
website and the listing are the same business, and it was previously impossible to save these
(the field was missing from the database schema).

Leaving a field blank is fine — it is simply left out of the structured data. **Do not guess
coordinates or hours**: values that disagree with the verified listing are worse than absent ones.

## 4. Keep it alive

- **Reviews:** ask satisfied plant customers directly; reply to every review. Review count and
  recency are ranking factors. Never buy reviews — Google filters them and can suspend the listing.
- **Posts:** publish a Google post when a new machine line, project, or blog article goes up.
- **Q&A:** seed the questions buyers actually ask and answer them from the owner account.
- **Citations:** make sure IndiaMART, JustDial, TradeIndia and similar listings use the exact NAP
  above. Inconsistent citations are the most common cause of weak local ranking.

## 5. Verify the result

After saving the admin settings and deploying:

```bash
curl -s https://dnrtechnoservices.com | grep -o '"@type":"LocalBusiness"'
```

Then run the homepage through the [Rich Results Test](https://search.google.com/test/rich-results)
and confirm the `LocalBusiness` block shows the address parts, geo, hours, and `sameAs`.
