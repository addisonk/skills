import type { ComponentPropsWithoutRef, ReactNode } from "react"

type ComponentNameProps = Omit<
  ComponentPropsWithoutRef<"article">,
  "children" | "title"
> & {
  title: string
  size?: "default" | "compact"
  actionLabel?: string
  onAction?: () => void
  children?: ReactNode
  titleClassName?: string
  contentClassName?: string
  actionClassName?: string
}

function mergeClassNames(...values: Array<string | undefined>) {
  return values.filter(Boolean).join(" ")
}

// Presentational: no data fetching, no auth, no routing. Props in, callbacks out.
export function ComponentName({
  title,
  size = "default",
  actionLabel = "Continue",
  onAction,
  children,
  className,
  titleClassName,
  contentClassName,
  actionClassName,
  ...articleProps
}: ComponentNameProps) {
  return (
    <article
      {...articleProps}
      data-slot="component-name"
      data-size={size}
      className={mergeClassNames("component-name", className)}
    >
      <h3
        data-slot="component-name-title"
        className={mergeClassNames("component-name__title", titleClassName)}
      >
        {title}
      </h3>
      <div
        data-slot="component-name-content"
        className={mergeClassNames("component-name__content", contentClassName)}
      >
        {children}
      </div>
      {onAction ? (
        <button
          data-slot="component-name-action"
          className={mergeClassNames("component-name__action", actionClassName)}
          onClick={onAction}
          type="button"
        >
          {actionLabel}
        </button>
      ) : null}
    </article>
  )
}
