"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  type FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
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
 * complete image. Images retain their natural size when they fit, while wide
 * images scale down to the available width. The dialog body scrolls vertically
 * when the fitted image is taller than the viewport.
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
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const deleteDialogRef = useRef<HTMLDialogElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteSecret, setDeleteSecret] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
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

  const openDelete = useCallback(() => {
    setDeleteSecret("");
    setDeleteError(null);
    setIsDeleteOpen(true);
    deleteDialogRef.current?.showModal();
  }, []);

  const closeDelete = useCallback(() => {
    if (!isDeleting) {
      deleteDialogRef.current?.close();
    }
  }, [isDeleting]);

  const handleDelete = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!deleteSecret.trim() || isDeleting) return;

    setIsDeleting(true);
    setDeleteError(null);

    const abortController = new AbortController();
    const timeoutId = window.setTimeout(() => abortController.abort(), 15_000);

    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: "DELETE",
        signal: abortController.signal,
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${deleteSecret}`,
        },
      });
      const payload: unknown = await response.json().catch(() => null);
      const result =
        payload && typeof payload === "object"
          ? (payload as Record<string, unknown>)
          : null;

      if (!response.ok) {
        const message =
          response.status === 401
            ? "The admin secret is incorrect."
            : typeof result?.error === "string"
              ? result.error
              : "The saved record could not be deleted.";
        throw new Error(message);
      }

      if (result?.success !== true || result.deletedId !== post.id) {
        throw new Error("The server returned an invalid deletion response.");
      }

      deleteDialogRef.current?.close();
      router.refresh();
    } catch (error) {
      setDeleteError(
        error instanceof DOMException && error.name === "AbortError"
          ? "The deletion request timed out. Please try again."
          : error instanceof Error
            ? error.message
            : "The saved record could not be deleted."
      );
    } finally {
      window.clearTimeout(timeoutId);
      setIsDeleting(false);
    }
  };

  // Keep local state in sync when a dialog closes via Esc or its backdrop.
  useEffect(() => {
    const imageDialog = dialogRef.current;
    const deleteDialog = deleteDialogRef.current;
    if (!imageDialog || !deleteDialog) return;

    const handleImageClose = () => setIsOpen(false);
    const handleDeleteClose = () => setIsDeleteOpen(false);
    imageDialog.addEventListener("close", handleImageClose);
    deleteDialog.addEventListener("close", handleDeleteClose);
    return () => {
      imageDialog.removeEventListener("close", handleImageClose);
      deleteDialog.removeEventListener("close", handleDeleteClose);
    };
  }, []);

  // A modal dialog does not lock page scroll, so the dashboard would otherwise
  // scroll behind it.
  useEffect(() => {
    if (!isOpen && !isDeleteOpen) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen, isDeleteOpen]);

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
              🔍 Full image
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
            aria-label={`View full image: ${post.title}`}
            className={`absolute inset-0 cursor-zoom-in rounded-t-xl ${insetFocusRing}`}
          />
        </div>

        <div className="px-3 pb-3 sm:px-4 sm:pb-4">
          <div className="mt-3 flex flex-col items-start justify-between gap-2 border-t border-gray-800 pt-3 md:flex-row md:items-start">
            <a
              href={post.reddit_url}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex h-8 shrink-0 items-center rounded-sm text-xs text-blue-400 hover:text-blue-300 ${focusRing}`}
            >
              View on Reddit ↗
            </a>
            <div className="flex w-full flex-wrap items-start justify-between gap-2 md:min-w-0 md:w-auto md:flex-1 md:justify-end">
              <InstagramButton
                postId={post.id}
                imageUrl={post.image_url}
                caption={post.caption || post.title}
                title={post.title}
                alreadyPosted={post.posted_to_instagram}
              />
              <button
                type="button"
                onClick={openDelete}
                aria-haspopup="dialog"
                aria-controls={`delete-post-${post.id}`}
                aria-label={`Delete saved record: ${post.title}`}
                className={`inline-flex h-8 shrink-0 items-center justify-center rounded-lg border border-red-500/50 px-3 text-xs font-medium text-red-300 transition-colors hover:border-red-400 hover:bg-red-500/10 hover:text-red-200 ${focusRing}`}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </article>

      <dialog
        ref={deleteDialogRef}
        id={`delete-post-${post.id}`}
        aria-labelledby={`delete-post-title-${post.id}`}
        aria-describedby={`delete-post-description-${post.id}`}
        onCancel={(event) => {
          if (isDeleting) event.preventDefault();
        }}
        onClick={(event) => {
          if (event.target === deleteDialogRef.current) {
            closeDelete();
          }
        }}
        className="m-auto w-[92vw] max-w-lg overflow-hidden rounded-xl border border-gray-700 bg-gray-950 p-0 text-white backdrop:bg-black/80"
      >
        <form onSubmit={handleDelete} aria-busy={isDeleting}>
          <div className="border-b border-gray-800 p-5">
            <h2
              id={`delete-post-title-${post.id}`}
              className="text-lg font-semibold text-red-200"
            >
              Delete saved record?
            </h2>
            <p
              id={`delete-post-description-${post.id}`}
              className="mt-3 break-words text-sm leading-6 text-gray-300"
            >
              Remove &ldquo;{post.title}&rdquo; from this dashboard. This does not
              delete the original Reddit post or source image, but the saved
              record cannot be restored.
            </p>

            <label
              htmlFor={`delete-secret-${post.id}`}
              className="mt-5 block text-sm font-medium text-gray-200"
            >
              Admin secret
            </label>
            <input
              id={`delete-secret-${post.id}`}
              type="password"
              value={deleteSecret}
              onChange={(event) => setDeleteSecret(event.target.value)}
              required
              disabled={isDeleting}
              autoComplete="off"
              spellCheck={false}
              className={`mt-2 w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white placeholder:text-gray-600 disabled:cursor-wait disabled:opacity-70 ${focusRing}`}
              placeholder="Enter the same secret used for Run Scrape"
            />
            <p className="mt-2 text-xs text-gray-500">
              Confirmation requires the same CRON_SECRET used by Run Scrape.
            </p>

            {deleteError && (
              <p role="alert" className="mt-4 text-sm text-red-300">
                {deleteError}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 bg-gray-900/60 px-5 py-4">
            <button
              type="button"
              onClick={closeDelete}
              disabled={isDeleting}
              className={`rounded-lg border border-gray-700 px-4 py-2 text-sm font-medium text-gray-200 transition-colors hover:bg-gray-800 disabled:cursor-wait disabled:opacity-50 ${focusRing}`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isDeleting || !deleteSecret.trim()}
              className={`rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:bg-red-900 disabled:text-red-300 ${focusRing}`}
            >
              {isDeleting ? "Deleting…" : "Delete record"}
            </button>
          </div>
        </form>
      </dialog>

      {/*
        Rendered as a sibling of <article> so the card element contains only card
        content. Nesting the dialog inside it duplicated the subreddit and
        "View on Reddit" text within the card's own subtree.

        This never occupies a grid cell: while closed it is display:none (see the
        `open:flex` note below), and while open it is in the top layer.
      */}
      <dialog
        ref={dialogRef}
        aria-label={`Full image: ${post.title}`}
        onClick={(event) => {
          // Clicking the backdrop (the dialog element itself) closes the dialog.
          if (event.target === dialogRef.current) {
            close();
          }
        }}
        /*
          `open:flex` rather than `flex`: an unconditional display utility is
          author-origin CSS and would override the user-agent
          `dialog:not([open]) { display: none }` rule, leaving a closed dialog
          painted over the grid and intercepting clicks.

          `m-auto` restores the native dialog centering that Tailwind's
          preflight margin reset removes.
        */
        className="m-auto max-h-[95dvh] max-w-[97vw] flex-col overflow-hidden rounded-xl border border-gray-700 bg-gray-950 p-0 text-white backdrop:bg-black/80 open:flex"
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-gray-800 bg-gray-950 p-4">
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold sm:text-base">
              {post.title}
            </h2>
            <p className="mt-1 text-xs text-gray-400">
              r/{post.subreddit} · u/{post.author}
              {naturalSize
                ? ` · ${naturalSize.width} × ${naturalSize.height} px (source dimensions)`
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

        {/* Wide images fit the dialog; tall images scroll vertically. */}
        <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain bg-gray-900/40">
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
                 source dimensions are unknown, and the dialog must preserve
                 natural sizing unless the image is too wide to fit. */
              <img
                ref={measure}
                src={post.image_url}
                alt={post.title}
                referrerPolicy="no-referrer"
                className="block h-auto max-w-full"
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
