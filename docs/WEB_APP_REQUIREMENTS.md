# Web App Requirements

## Purpose
High‑conversion site (AR/EN, RTL), section‑based, with forms that hit `/api/leads/capture` or GraphQL mutations.

## IA & Sections
| Section | Purpose |
|---|---|
| Hero | Value prop + primary CTA |
| Services | Cards → RFQ |
| Projects | Proof |
| Testimonials | Trust |
| FAQ | Objection handling |
| CTA | Sticky mobile CTA |

## i18n & RTL
- `next-intl`, locale prefixes (`/ar`, `/en`), `<html dir="rtl">` for Arabic.

## Forms
- RHF + Zod; CAPTCHA v3/invisible.
- On submit → REST `POST /api/leads/capture` or GraphQL `createLead`.

## Freshness
- Pages use **ISR** + tags. When CMS mutates content, API triggers `revalidateTag('content:<model>')`.
- For real‑time blocks (e.g., lead count), render via **dynamic server components** (no ISR).
