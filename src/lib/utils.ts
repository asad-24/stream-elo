export function cn(
  ...inputs: Array<string | false | null | undefined>
): string {
  return inputs.filter(Boolean).join(" ");
}

export function youtubeEmbedUrl(url: string) {
  const id = url.match(/(?:youtu\.be\/|v=)([^?&]+)/)?.[1];
  return id ? `https://www.youtube.com/embed/${id}` : url;
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
