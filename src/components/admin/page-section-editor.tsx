"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type MediaOption = { id: string; title: string; mediaType: "image" | "video"; publicUrl: string };
type Section = { id: string; page: string; section: string; sectionType: string; heading: string; subheading: string; body: string; status: string; sortOrder: number; isActive: boolean; mediaIds: string[]; data: Record<string, unknown> };

export function PageSectionEditor({ section, media }: { section: Section; media: MediaOption[] }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const data = section.data ?? {};

  async function save(formData: FormData) {
    setBusy(true); setMessage("");
    const nextData: Record<string, unknown> = { ...data };
    if (section.sectionType === "hero") {
      nextData.displayMode = String(formData.get("displayMode") ?? "video");
      nextData.backgroundMediaId = String(formData.get("backgroundMediaId") ?? "") || null;
      nextData.posterMediaId = String(formData.get("posterMediaId") ?? "") || null;
      nextData.primaryButton = { label: String(formData.get("primaryLabel") ?? ""), href: String(formData.get("primaryHref") ?? "") };
      nextData.secondaryButton = { label: String(formData.get("secondaryLabel") ?? ""), href: String(formData.get("secondaryHref") ?? "") };
    }
    if (section.sectionType === "cta") nextData.button = { label: String(formData.get("buttonLabel") ?? ""), href: String(formData.get("buttonHref") ?? "") };
    const response = await fetch(`/api/admin/content/page-sections/${section.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ page: section.page, section: section.section, sectionType: section.sectionType, heading: formData.get("heading"), subheading: formData.get("subheading"), body: formData.get("body"), mediaIds: formData.getAll("mediaIds").map(String), data: nextData, status: section.status, sortOrder: Number(formData.get("sortOrder")), isActive: formData.get("isActive") === "on" }) });
    const result = await response.json(); setBusy(false); setMessage(response.ok ? "Draft saved." : result.error ?? "Unable to save."); if (response.ok) router.refresh();
  }
  async function publish(published: boolean) {
    setBusy(true); const response = await fetch(`/api/admin/content/page-sections/${section.id}/publish`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ published }) });
    const result = await response.json(); setBusy(false); setMessage(response.ok ? (published ? "Published." : "Returned to draft.") : result.error ?? "Unable to publish."); if (response.ok) router.refresh();
  }
  const primary = data.primaryButton as { label?: string; href?: string } | undefined;
  const secondary = data.secondaryButton as { label?: string; href?: string } | undefined;
  const button = data.button as { label?: string; href?: string } | undefined;
  const images = media.filter((item) => item.mediaType === "image"); const videos = media.filter((item) => item.mediaType === "video");
  const field = "min-h-12 border border-papyrus/15 bg-obsidian px-4 text-papyrus";
  return <form action={save} className="grid gap-5">
    <div className="grid gap-4 md:grid-cols-2"><label className="grid gap-2"><span className="label">Heading</span><input name="heading" defaultValue={section.heading} className={field} /></label><label className="grid gap-2"><span className="label">Eyebrow / subheading</span><input name="subheading" defaultValue={section.subheading} className={field} /></label></div>
    <label className="grid gap-2"><span className="label">Body</span><textarea name="body" defaultValue={section.body} rows={5} className={`${field} py-3`} /></label>
    {section.sectionType === "hero" ? <div className="grid gap-4 border border-papyrus/10 p-5"><div className="grid gap-4 md:grid-cols-3"><label className="grid gap-2"><span className="label">Display</span><select name="displayMode" defaultValue={String(data.displayMode ?? "video")} className={field}><option value="video">Video</option><option value="image">Image</option></select></label><label className="grid gap-2"><span className="label">Background media</span><select name="backgroundMediaId" defaultValue={String(data.backgroundMediaId ?? "")} className={field}><option value="">Legacy fallback</option>{[...videos, ...images].map((item) => <option key={item.id} value={item.id}>{item.title} ({item.mediaType})</option>)}</select></label><label className="grid gap-2"><span className="label">Video poster</span><select name="posterMediaId" defaultValue={String(data.posterMediaId ?? "")} className={field}><option value="">Legacy fallback</option>{images.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label></div><div className="grid gap-4 md:grid-cols-2"><input name="primaryLabel" defaultValue={primary?.label} placeholder="Primary button label" className={field} /><input name="primaryHref" defaultValue={primary?.href} placeholder="/portfolio" className={field} /><input name="secondaryLabel" defaultValue={secondary?.label} placeholder="Secondary button label" className={field} /><input name="secondaryHref" defaultValue={secondary?.href} placeholder="/contact" className={field} /></div></div> : null}
    {section.sectionType === "cta" ? <div className="grid gap-4 border border-papyrus/10 p-5 md:grid-cols-2"><input name="buttonLabel" defaultValue={button?.label} placeholder="Button label" className={field} /><input name="buttonHref" defaultValue={button?.href} placeholder="/contact" className={field} /></div> : null}
    <label className="grid gap-2"><span className="label">Section gallery images</span><select multiple name="mediaIds" defaultValue={section.mediaIds} className={`${field} min-h-40 py-2`}>{images.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select><span className="text-xs text-papyrus/45">Hold Ctrl/Cmd to select multiple uploaded R2 images. Their order controls galleries.</span></label>
    <div className="flex flex-wrap items-center gap-4"><label className="flex items-center gap-2"><input type="checkbox" name="isActive" defaultChecked={section.isActive} /> Active</label><label className="flex items-center gap-2"><span className="label">Order</span><input name="sortOrder" type="number" defaultValue={section.sortOrder} className={`${field} w-24`} /></label></div>
    {message ? <p className="text-sm text-sahel">{message}</p> : null}<div className="flex flex-wrap gap-3"><button disabled={busy} className="rounded-full bg-sahel px-5 py-3 text-xs font-bold uppercase text-obsidian">Save draft</button><button type="button" disabled={busy} onClick={() => publish(section.status !== "published")} className="rounded-full border border-papyrus/20 px-5 py-3 text-xs font-bold uppercase">{section.status === "published" ? "Unpublish" : "Publish"}</button></div>
  </form>;
}
