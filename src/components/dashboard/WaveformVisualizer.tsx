"use client";

import { useEffect, useRef } from "react";

type Props = {
  stream: MediaStream | null;
  isRecording: boolean;
};

export default function WaveformVisualizer({ stream, isRecording }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!stream || !isRecording) {
      // Draw flat idle line when not recording
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      analyserRef.current = null;
      audioCtxRef.current?.close();
      audioCtxRef.current = null;
      drawIdle(ctx, canvas.width, canvas.height);
      return;
    }

    const audioCtx = new AudioContext();
    audioCtxRef.current = audioCtx;
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0.8;
    analyserRef.current = analyser;

    const source = audioCtx.createMediaStreamSource(stream);
    source.connect(analyser);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function draw() {
      animFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);

      const w = canvas!.width;
      const h = canvas!.height;

      ctx!.clearRect(0, 0, w, h);

      // Background
      ctx!.fillStyle = "rgba(0,0,0,0)";
      ctx!.fillRect(0, 0, w, h);

      // Gradient stroke
      const gradient = ctx!.createLinearGradient(0, 0, w, 0);
      gradient.addColorStop(0, "rgba(56,189,248,0.2)");
      gradient.addColorStop(0.3, "rgba(56,189,248,0.9)");
      gradient.addColorStop(0.5, "rgba(52,211,153,1)");
      gradient.addColorStop(0.7, "rgba(56,189,248,0.9)");
      gradient.addColorStop(1, "rgba(56,189,248,0.2)");

      ctx!.lineWidth = 2.5;
      ctx!.strokeStyle = gradient;
      ctx!.shadowBlur = 8;
      ctx!.shadowColor = "rgba(52,211,153,0.6)";
      ctx!.beginPath();

      const sliceWidth = w / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * h) / 2;
        if (i === 0) ctx!.moveTo(x, y);
        else ctx!.lineTo(x, y);
        x += sliceWidth;
      }

      ctx!.lineTo(w, h / 2);
      ctx!.stroke();
      ctx!.shadowBlur = 0;
    }

    draw();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      audioCtx.close();
    };
  }, [stream, isRecording]);

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={80}
      className="w-full rounded-2xl"
      style={{ background: "rgba(0,0,0,0.25)" }}
    />
  );
}

function drawIdle(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.clearRect(0, 0, w, h);
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = "rgba(148,163,184,0.3)";
  ctx.beginPath();
  ctx.moveTo(0, h / 2);
  ctx.lineTo(w, h / 2);
  ctx.stroke();
}
