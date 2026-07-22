# Typography Changes

Date: 2026-07-22

## Goal

Reduce oversized headings by about 10-20% while preserving the existing cinematic/editorial visual style.

## Shared Section Heading

Previous:

```text
text-5xl md:text-7xl lg:text-8xl
```

New:

```text
text-4xl sm:text-5xl md:text-6xl lg:text-7xl
```

File:

```text
src/components/section-heading.tsx
```

## Homepage Hero

Previous:

```text
text-5xl md:text-7xl lg:text-8xl
```

New:

```text
text-4xl sm:text-5xl md:text-6xl lg:text-7xl
```

File:

```text
src/app/page.tsx
```

## About And Contact Heroes

Previous:

```text
text-6xl md:text-8xl
```

New:

```text
text-5xl md:text-7xl
```

Files:

```text
src/app/about/page.tsx
src/app/contact/page.tsx
```

## Homepage Manifesto And CTA

Previous:

```text
text-5xl md:text-7xl
```

New:

```text
text-4xl md:text-6xl
```

File:

```text
src/app/page.tsx
```

## Card Titles

Previous common scale:

```text
text-4xl
text-4xl md:text-5xl
```

New common scale:

```text
text-3xl
text-3xl md:text-4xl
```

Files:

```text
src/components/film-card.tsx
src/components/theatre-card.tsx
src/components/interactive/portfolio-filter.tsx
```

## Interactive Panel Titles

Success story title:

```text
text-5xl -> text-4xl
```

BTS gallery title:

```text
text-5xl -> text-4xl
```

Stats counter:

```text
text-7xl md:text-8xl -> text-6xl md:text-7xl
```

Partnership label:

```text
text-4xl -> text-3xl
```

## Notes

- Body text was not reduced.
- Navigation and button label sizes were preserved.
- Responsive behavior was preserved.
- Shared heading changes cover most public pages because they use `SectionHeading`.
