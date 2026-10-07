// @vitest-environment jsdom

import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import MathTypeset from "./MathTypeset";

vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
const roots: ReturnType<typeof createRoot>[] = [];

afterEach(async () => {
  await act(async () => {
    for (const root of roots.splice(0)) root.unmount();
  });
  document.body.replaceChildren();
});

async function render(tex: string, display = true) {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  roots.push(root);
  await act(async () => {
    root.render(<MathTypeset tex={tex} display={display} fallback={<span>{tex}</span>} />);
  });
  return container;
}

describe("math typesetting", () => {
  it.each([
    String.raw`\frac{1}{2} + \sum_{i=1}^n x_i`,
    String.raw`\begin{pmatrix}a & b \\ c & d\end{pmatrix}`,
    String.raw`\begin{aligned}a &= b \\ c &= d\end{aligned}`,
  ])("renders research equations with accessible MathML: %s", async (tex) => {
    const container = await render(tex);
    expect(container.querySelector(".katex-html")).not.toBeNull();
    expect(container.querySelector("math")).not.toBeNull();
    expect(container.querySelector('annotation[encoding="application/x-tex"]')?.textContent).toBe(
      tex,
    );
  });

  it("keeps invalid TeX readable", async () => {
    const tex = String.raw`\frac{1}{`;
    const container = await render(tex);
    expect(container.querySelector(".katex")).toBeNull();
    expect(container.textContent).toBe(tex);
  });

  it("does not turn TeX into executable links or HTML", async () => {
    const container = await render(String.raw`\href{javascript:alert(1)}{click}`);
    expect(container.querySelector("a, script, [onclick]")).toBeNull();
  });
});
