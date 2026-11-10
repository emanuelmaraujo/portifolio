"use client";

import { useEffect, useRef } from "react";

export default function SignalMotion() {
  const stage = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const host = stage.current;
    if (!host) return;
    const policy = matchMedia("(min-width: 760px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    let stop = () => {};
    let version = 0;
    const activate = () => {
      stop();
      const current = ++version;
      if (!policy.matches) return;
      const loader = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return;
        loader.disconnect();
        void import("./signalGeometry").then(({ drawSignal }) => {
          if (current !== version) return;
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) return;
          canvas.setAttribute("aria-hidden", "true");
          host.appendChild(canvas);
          let active = false;
          let frame = 0;
          let targetX = 0;
          let targetY = 0;
          let currentX = 0;
          let currentY = 0;
          let scroll = 0;
          let width = 1;
          let height = 1;
          const render = () => {
            frame = 0;
            currentX += (targetX - currentX) * 0.15;
            currentY += (targetY - currentY) * 0.15;
            ctx.setTransform(width / 620, 0, 0, height / 540, 0, 0);
            ctx.clearRect(0, 0, 620, 540);
            drawSignal(ctx, -0.49 + currentX + scroll, 0.26 + currentY);
            host.dataset.live = "true";
            if (Math.abs(targetX - currentX) + Math.abs(targetY - currentY) > 0.001) request();
          };
          const request = () => {
            if (active && !frame) frame = requestAnimationFrame(render);
          };
          const resize = () => {
            const density = Math.min(devicePixelRatio, 1.5);
            width = canvas.width = Math.max(1, Math.round(host.clientWidth * density));
            height = canvas.height = Math.max(1, Math.round(host.clientHeight * density));
            request();
          };
          const move = (event: PointerEvent) => {
            const bounds = host.getBoundingClientRect();
            targetX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 0.55;
            targetY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 0.36;
            request();
          };
          const reset = () => { targetX = targetY = 0; request(); };
          const onScroll = () => {
            if (!active) return;
            scroll = Math.min(window.scrollY / 1500, 0.24);
            request();
          };
          const resizeObserver = new ResizeObserver(resize);
          resize();
          resizeObserver.observe(host);
          const visibility = new IntersectionObserver(([entry]) => {
            active = entry.isIntersecting;
            if (active) onScroll();
            else { cancelAnimationFrame(frame); frame = 0; }
          });
          visibility.observe(host);
          host.addEventListener("pointermove", move);
          host.addEventListener("pointerleave", reset);
          window.addEventListener("scroll", onScroll, { passive: true });
          const lost = () => stop();
          canvas.addEventListener("contextlost", lost, { once: true });
          stop = () => {
            canvas.removeEventListener("contextlost", lost);
            visibility.disconnect();
            resizeObserver.disconnect();
            cancelAnimationFrame(frame);
            host.removeEventListener("pointermove", move);
            host.removeEventListener("pointerleave", reset);
            window.removeEventListener("scroll", onScroll);
            delete host.dataset.live;
            canvas.remove();
          };
        }).catch(() => { /* Keep the server-rendered illustration. */ });
      });
      loader.observe(host);
      stop = () => loader.disconnect();
    };
    activate();
    policy.addEventListener("change", activate);
    return () => {
      ++version;
      stop();
      policy.removeEventListener("change", activate);
    };
  }, []);
  return <div className="signal-motion" ref={stage} aria-hidden="true" />;
}
