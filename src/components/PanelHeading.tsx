import type { ReactNode } from "react";

export function PanelHeading({ icon, id, title }: { icon: ReactNode; id: string; title: string }) {
  return (
    <h2 className="panel-heading" id={id}>
      {icon}
      {title}
    </h2>
  );
}
