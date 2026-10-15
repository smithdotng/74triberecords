"use client";

import { Icon } from "./ui/Icon";
import { useToast } from "./ui/Toast";

export function ShareButton({ title, url }: { title: string; url?: string }) {
  const toast = useToast();
  const onClick = async () => {
    const href = url ?? window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url: href });
      } catch {
        /* dismissed */
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(href);
      toast("Link copied");
    } catch {
      toast("Couldn't copy the link", "error");
    }
  };
  return (
    <button onClick={onClick} className="btn btn-quiet" aria-label={`Share ${title}`}>
      <Icon name="share" size={18} />
      Share
    </button>
  );
}
