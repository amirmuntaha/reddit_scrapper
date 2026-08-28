"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import InstagramButton from "./InstagramButton";

export interface DashboardPost {
  id: number;
  title: string;
  image_url: string;
  caption: string | null;
  subreddit: string;
  author: string;
  reddit_url: string;
  score: number;
  posted_to_instagram: boolean;
  scraped_at: string;
}

interface PostCardProps {
  post: DashboardPost;
  /**
   * Pre-formatted on the server so the markup does not depend on the visitor's
   * locale or time zone, which would cause a hydration mismatch.
   */
  scoreLabel: string;
  scrapedDateLabel: string;
}

/** App-wide link/button focus style. */
const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-400";

/**
 * The card overlay needs an inset ring: an outward offset would be painted
 * outside the article's padding box and clipped by its `overflow-hidden`.
 */
const insetFocusRing =
  "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-orange-400";

/**
 * A dashboard record card. The preview area opens a modal dialog showing the
 * image at its natural size — never scaled down — so a reviewer can inspect the
 * real pixels. The dialog body scrolls on both axes when the image is larger
 * than the viewport.
 *
 * The clickable region is an overlay button that is a sibling of the card
 * content, not its parent: that keeps the title a real heading, keeps the
 * accessible name short, and leaves the Reddit link and download control
 * outside the clickable area so the card has no nested interactive elements.
 */
export default function PostCard({
  post,
  scoreLabel,
  scrapedDateLabel,
}: PostCardProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [naturalSize, setNaturalSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [failed, setFailed] = useState(false);

  const open = useCallback(() => {
    setFailed(false);
    setNaturalSize(null);
    setIsOpen(true);
    dialogRef.current?.showModal();
  }, []);

  const close = useCallback(() => {
    dialogRef.current?.close();
  }, []);

  // Keep local state in sync when the dialog closes via Esc or the backdrop.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => setIsOpen(false);
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, []);

  // A modal dialog does not lock page scroll, so the dashboard would otherwise
  // scroll behind the image.
  useEffect(() => {
    if (!isOpen) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);

  /** Records the intrinsic size, including when the image is already cached. */
  const measure = useCallback((node: HTMLImageElement | null) => {
    if (node?.complete && node.naturalWidth > 0) {
      setNaturalSize({ width: node.naturalWidth, height: node.naturalHeight });
    }
  }, []);

  return (
    <>
      <article className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900 transition-colors hover:border-gray-700">
        <div className="group relative">
          <div className="relative aspect-square bg-gray-800">
            <Image
              src={post.image_url}
              alt={post.title}
              fill
              className="object-cover"
              referrerPolicy="no-referrer"
              unoptimized
            />
            {post.posted_to_instagram && (
              <div className="absolute right-2 top-2 rounded bg-green-500/90 px-2 py-1 text-xs font-medium">
                ✓ Posted
              </div>
            )}
            <span
              aria-hidden="true"
              className="absolute bottom-2 left-2 rounded-full bg-black/70 px-2 py-1 text-xs font-medium text-white opacity-80 transition-opacity group-hover:opacity-100"
            >
              🔍 Full size
            </span>
          </div>

          <div className="p-3 pb-0 sm:p-4 sm:pb-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-orange-500/20 px-2 py-0.5 text-xs text-orange-400">
                r/{post.subreddit}
              </span>
              <span className="text-xs text-gray-500">⬆ {scoreLabel}</span>
            </div>

            <h3 className="mb-2 line-clamp-2 text-sm font-medium group-hover:text-orange-200">
              {post.title}
            </h3>

            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="mr-2 truncate">u/{post.author}</span>
              <span className="shrink-0">{scrapedDateLabel}</span>
            </div>
          </div>

          {/* Covers the preview and metadata, but not the action row below it. */}
          <button
            type="button"
            onClick={open}
            aria-haspopup="dialog"
            aria-label={`View full size image: ${post.title}`}
            className={`absolute inset-0 cursor-zoom-in rounded-t-xl ${insetFocusRing}`}
          />
        </div>

        <div className="px-3 pb-3 sm:px-4 sm:pb-4">
          <div className="mt-3 flex flex-col items-start justify-between gap-2 border-t border-gray-800 pt-3 sm:flex-row sm:items-center">
            <a
              href={post.reddit_url}
              target="_blank"
              rel="noopener noreferrer"
              className={`rounded-sm text-xs text-blue-400 hover:text-blue-300 ${focusRing}`}
            >
              View on Reddit ↗
            </a>
            <InstagramButton
              postId={post.id}
              imageUrl={post.image_url}
              caption={post.caption || post.title}
              title={post.title}
              alreadyPosted={post.posted_to_instagram}
            />
          </div>
        </div>
      </article>

      {/*
        Rendered as a sibling of <article> so the card element contains only card
        content. Nesting the dialog inside it duplicated the subreddit and
        "View on Reddit" text within the card's own subtree. A closed dialog is
        display:none and an open one is in the top layer, so it never occupies a
        grid cell.
      */}
      <dialog
        ref={dialogRef}
        aria-label={`Full size image: ${post.title}`}
        onClick={(event) => {
          // Clicking the backdrop (the dialog element itself) closes the dialog.
          if (event.target === dialogRef.current) {
            close();
          }
        }}
        /* m-auto restores the native dialog centering that Tailwind's preflight
           margin reset removes. */
        className="m-auto flex max-h-[95dvh] max-w-[97vw] flex-col overflow-hidden rounded-xl border border-gray-700 bg-gray-950 p-0 text-white backdrop:bg-black/80"
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-gray-800 bg-gray-950 p-4">
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold sm:text-base">
              {post.title}
            </h2>
            <p className="mt-1 text-xs text-gray-400">
              r/{post.subreddit} · u/{post.author}
              {naturalSize
                ? ` · ${naturalSize.width} × ${naturalSize.height} px (actual size)`
                : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            className={`shrink-0 rounded-lg border border-gray-700 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-gray-800 ${focusRing}`}
          >
            Close ✕
          </button>
        </header>

        {/* Scrolls on both axes when the image exceeds the dialog. */}
        <div className="min-h-0 flex-1 overflow-auto overscroll-contain bg-gray-900/40">
          {isOpen &&
            (failed ? (
              <p className="p-8 text-center text-sm text-gray-400">
                This image could not be loaded. It may have been removed from the
                source host.{" "}
                <a
                  href={post.reddit_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 underline underline-offset-4 hover:text-blue-300"
                >
                  Open the Reddit post ↗
                </a>
              </p>
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element -- the
                 dialog must render the third-party image at its intrinsic
                 size, which next/image cannot do without known dimensions. */
              <img
                ref={measure}
                src={post.image_url}
                alt={post.title}
                referrerPolicy="no-referrer"
                className="block max-w-none"
                onLoad={(event) =>
                  setNaturalSize({
                    width: event.currentTarget.naturalWidth,
                    height: event.currentTarget.naturalHeight,
                  })
                }
                onError={() => setFailed(true)}
              />
            ))}
        </div>

        <footer className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-gray-800 bg-gray-950 px-4 py-3 text-xs text-gray-400">
          <span>Scraped {scrapedDateLabel}</span>
          <a
            href={post.reddit_url}
            target="_blank"
            rel="noopener noreferrer"
            className={`rounded-sm text-blue-400 hover:text-blue-300 ${focusRing}`}
          >
            View on Reddit ↗
          </a>
        </footer>
      </dialog>
    </>
  );
}
