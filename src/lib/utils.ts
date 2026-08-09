export function cn(
  ...inputs: Array<string | false | null | undefined>
): string {
  return inputs.filter(Boolean).join(" ");
}

export function youtubeEmbedUrl(url: string) {
  const id = youtubeVideoId(url);
  return id ? `https://www.youtube.com/embed/${id}` : url;
}

export function youtubeVideoId(value: string) {
  try {
    const url = new URL(value.trim());
    const hostname = url.hostname.toLowerCase().replace(/^www\./, "");
    let id = "";
    if (hostname === "youtu.be") {
      id = url.pathname.split("/").filter(Boolean)[0] ?? "";
    } else if (["youtube.com", "m.youtube.com", "music.youtube.com", "youtube-nocookie.com"].includes(hostname)) {
      const path = url.pathname.split("/").filter(Boolean);
      id = url.searchParams.get("v") ?? (["embed", "shorts", "live"].includes(path[0] ?? "") ? path[1] ?? "" : "");
    }
    return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

export function mailtoUrl({
  to,
  name,
  email,
  focus,
  message,
}: {
  to: string;
  name: string;
  email: string;
  focus: string;
  message: string;
}) {
  const subject = encodeURIComponent(`Meroestream enquiry from ${name}`);
  const body = encodeURIComponent(
    `Name: ${name}\nEmail: ${email}\nFocus: ${focus}\n\n${message}`,
  );

  return `mailto:${to}?subject=${subject}&body=${body}`;
}
