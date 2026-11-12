"use client";

import { Children, cloneElement, isValidElement, type HTMLAttributes, type ReactNode } from "react";

export default function Rail({ children, label }: { children: ReactNode; label: string }) {
  return <div className="rail" role="group" tabIndex={0} aria-label={label}>
    <div className="track">
      <div className="rail-group">{children}</div>
      <div className="rail-group rail-copy" aria-hidden="true">{Children.map(children, (child) => isValidElement<HTMLAttributes<HTMLElement>>(child) ? cloneElement(child, { tabIndex: -1, "aria-hidden": true }) : null)}</div>
    </div>
  </div>;
}
