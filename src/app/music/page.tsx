import type { Metadata } from "next";
import { MusicCard } from "@/components/music-card";
import { SectionHeading } from "@/components/section-heading";
import { getPageHeader, getProjectsContent } from "@/lib/content-service";

export const metadata: Metadata = { title: "Music", description: "Stream Meroestream music across your preferred platforms." };
export const dynamic = "force-dynamic";
export default async function MusicPage() { const [projects,header]=await Promise.all([getProjectsContent(),getPageHeader("music",{eyebrow:"Music",heading:"Sound, story, and memory",body:"Listen to Meroestream music and performance projects across your preferred platforms."})]);const music=projects.filter(project=>project.category==="Music");return <section className="bg-obsidian pt-36 md:pt-44"><div className="container-shell pb-20 md:pb-28"><SectionHeading eyebrow={header.eyebrow} title={header.heading} intro={header.body}/><div className="mt-12 grid gap-6">{music.map(project=><MusicCard key={project.slug} project={project}/>)}</div></div></section>;}
