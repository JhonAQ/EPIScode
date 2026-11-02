"use client";

import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

const MIN_HEIGHT = 320;
const HEIGHT_STEP = 16;

// Clases completas para que Tailwind las detecte, sin generar CSS ni estilos en línea.
const HEIGHT_CLASSES = [
  "h-[320px]", "h-[336px]", "h-[352px]", "h-[368px]",
  "h-[384px]", "h-[400px]", "h-[416px]", "h-[432px]",
  "h-[448px]", "h-[464px]", "h-[480px]", "h-[496px]",
  "h-[512px]", "h-[528px]", "h-[544px]", "h-[560px]",
  "h-[576px]", "h-[592px]", "h-[608px]", "h-[624px]",
  "h-[640px]", "h-[656px]", "h-[672px]", "h-[688px]",
  "h-[704px]", "h-[720px]", "h-[736px]", "h-[752px]",
  "h-[768px]", "h-[784px]", "h-[800px]", "h-[816px]",
  "h-[832px]", "h-[848px]", "h-[864px]", "h-[880px]",
  "h-[896px]", "h-[912px]", "h-[928px]", "h-[944px]",
  "h-[960px]", "h-[976px]", "h-[992px]", "h-[1008px]",
  "h-[1024px]", "h-[1040px]", "h-[1056px]", "h-[1072px]",
  "h-[1088px]", "h-[1104px]", "h-[1120px]", "h-[1136px]",
  "h-[1152px]", "h-[1168px]", "h-[1184px]", "h-[1200px]",
  "h-[1216px]", "h-[1232px]", "h-[1248px]", "h-[1264px]", "h-[1280px]",
] as const;

interface DragStart {
  pointerId: number;
  y: number;
  height: number;
}

/** Ajusta solo la altura mediante el tirador superior, en pasos pequeños de 16 px. */
export function useChatResize() {
  const panelRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragStart | null>(null);
  const [heightIndex, setHeightIndex] = useState<number | null>(null);
  const [resizing, setResizing] = useState(false);

  function updateHeight(requestedHeight: number) {
    const panel = panelRef.current;
    if (!panel) return;

    const maximumHeight = parseFloat(getComputedStyle(panel).maxHeight);
    const boundedHeight = Math.min(maximumHeight, Math.max(MIN_HEIGHT, requestedHeight));
    const index = Math.round((boundedHeight - MIN_HEIGHT) / HEIGHT_STEP);
    setHeightIndex(Math.max(0, Math.min(HEIGHT_CLASSES.length - 1, index)));
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0 || !event.isPrimary || !panelRef.current) return;
    event.preventDefault();
    event.currentTarget.focus({ preventScroll: true });
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      y: event.clientY,
      height: parseFloat(getComputedStyle(panelRef.current).height),
    };
    setResizing(true);
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const start = dragRef.current;
    if (!start || start.pointerId !== event.pointerId) return;
    // Al arrastrar hacia arriba, crece la ventana sin mover su borde inferior.
    updateHeight(start.height + start.y - event.clientY);
  }

  function stopResizing() {
    dragRef.current = null;
    setResizing(false);
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
    event.preventDefault();
    const panel = panelRef.current;
    if (!panel) return;
    const direction = event.key === "ArrowUp" ? 1 : -1;
    updateHeight(parseFloat(getComputedStyle(panel).height) + direction * HEIGHT_STEP);
  }

  return {
    panelRef,
    heightClassName: heightIndex === null ? "h-[min(410px,calc(100dvh-3rem))]" : HEIGHT_CLASSES[heightIndex],
    resizing,
    handleEvents: {
      onPointerDown,
      onPointerMove,
      onPointerUp: stopResizing,
      onPointerCancel: stopResizing,
      onLostPointerCapture: stopResizing,
      onKeyDown,
    },
  };
}
