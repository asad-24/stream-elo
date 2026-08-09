import { FittedCoverImage } from "@/components/ui/fitted-cover-image";
import { type Project } from "@/lib/content";
import { StatusBadge } from "@/components/status-badge";
import { VideoModal } from "@/components/interactive/video-modal";

export function MusicCard({ project }: { project: Project }) {
  return <article className="grid overflow-hidden border border-papyrus/10 bg-papyrus/[0.035] lg:grid-cols-[0.7fr_1fr]">
    <div className="relative min-h-[26rem] overflow-hidden"><FittedCoverImage src={project.poster} alt={`${project.title} cover`} sizes="(min-width:1024px) 36vw, 100vw" /></div>
    <div className="flex flex-col justify-between p-7 md:p-10"><div><div className="flex gap-3"><StatusBadge status={project.status}/><span className="label">Music</span></div><h2 className="mt-5 font-serif text-3xl text-papyrus">{project.title}</h2><p className="mt-3 text-sahel">{project.director}</p><p className="mt-6 leading-8 text-papyrus/65">{project.fullSynopsis}</p></div><div className="mt-8 flex flex-wrap gap-3">{project.video?<VideoModal video={project.video} title={project.title}/>:null}{project.platforms?.map(platform=><a key={`${platform.name}-${platform.url}`} href={platform.url} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center rounded-full border border-sahel/60 px-5 text-xs font-bold uppercase tracking-[0.14em] text-sahel hover:bg-sahel hover:text-obsidian">{platform.name}</a>)}</div></div>
  </article>;
}
