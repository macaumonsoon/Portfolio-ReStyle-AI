"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { BakedSvgMesh } from "@/components/webgl/baked-svg-mesh";

function Controls() {
  const { invalidate } = useThree();
  return (
    <OrbitControls
      enablePan={false}
      minDistance={2.8}
      maxDistance={7}
      enableDamping
      dampingFactor={0.08}
      onChange={() => invalidate()}
    />
  );
}

type Props = {
  svg: string;
  motion: boolean;
  className?: string;
  /** 為 true 時降低光栅解析度，重試 WebGL 時較易成功（大圖 / PDF 頁） */
  rasterDownshift?: boolean;
  onRasterError?: () => void;
};

/**
 * Three.js 預覽：SVG → Canvas 紋理 → 平面網格。
 * 僅供預覽；匯出仍必須使用 SVG SSOT（見 technical-three.md）。
 */
export default function SvgWebglPreview({
  svg,
  motion,
  className,
  rasterDownshift,
  onRasterError,
}: Props) {
  const [ready, setReady] = useState(false);

  const handleReady = useCallback(() => setReady(true), []);
  const handleError = useCallback(() => {
    setReady(false);
    onRasterError?.();
  }, [onRasterError]);

  useEffect(() => {
    setReady(false);
  }, [svg]);

  return (
    <div className={`relative h-full min-h-[16rem] w-full ${className ?? ""}`}>
      <Canvas
        className="h-full w-full"
        camera={{ position: [0, 0, 4.4], fov: 40, near: 0.1, far: 40 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        dpr={[1, 2]}
        frameloop="demand"
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
      >
        <color attach="background" args={["#f1f5f9"]} />
        <ambientLight intensity={0.72} />
        <directionalLight
          position={[5, 8, 6]}
          intensity={0.85}
          castShadow={false}
        />
        <hemisphereLight args={["#ffffff", "#cbd5e1", 0.55]} />
        <Suspense fallback={null}>
          <BakedSvgMesh
            svg={svg}
            motion={motion}
            rasterDownshift={rasterDownshift}
            onReady={handleReady}
            onError={handleError}
          />
        </Suspense>
        <Controls />
      </Canvas>
      {!ready && svg.trim() && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-muted/40 text-xs text-muted-foreground">
          正在烘焙 SVG 紋理…
        </div>
      )}
    </div>
  );
}
