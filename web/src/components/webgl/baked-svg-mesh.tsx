"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { rasterizeSvgToCanvas } from "@/lib/svg-rasterize";

type Props = {
  svg: string;
  /** 極輕微展示動效（不影響匯出） */
  motion: boolean;
  onReady?: () => void;
  onError?: () => void;
};

export function BakedSvgMesh({ svg, motion, onReady, onError }: Props) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [map, setMap] = useState<THREE.CanvasTexture | null>(null);
  const seqRef = useRef(0);
  const { gl, invalidate } = useThree();
  const onReadyRef = useRef(onReady);
  const onErrorRef = useRef(onError);
  onReadyRef.current = onReady;
  onErrorRef.current = onError;

  const aspect = useMemo(() => {
    const { w, h } = (() => {
      const vb = svg.match(/viewBox\s*=\s*["']\s*([\d.\s-]+)\s*["']/i);
      if (vb) {
        const p = vb[1].trim().split(/\s+/).map(Number);
        if (p.length >= 4 && p[2] > 0 && p[3] > 0)
          return { w: p[2], h: p[3] };
      }
      return { w: 4, h: 3 };
    })();
    return w / h;
  }, [svg]);

  const [planeW, planeH] =
    aspect >= 1 ? [2.4 * aspect, 2.4] : [2.4, 2.4 / aspect];

  useEffect(() => {
    if (!svg.trim()) {
      setMap((prev) => {
        prev?.dispose();
        return null;
      });
      return () => {};
    }

    const id = ++seqRef.current;
    let cancelled = false;

    void (async () => {
      const canvas = await rasterizeSvgToCanvas(svg, { maxSide: 2048, maxDpr: 2 });
      if (cancelled || id !== seqRef.current) return;
      if (!canvas) {
        onErrorRef.current?.();
        return;
      }

      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
      tex.needsUpdate = true;

      setMap((prev) => {
        prev?.dispose();
        return tex;
      });
      onReadyRef.current?.();
      invalidate();
    })();

    return () => {
      cancelled = true;
      setMap((prev) => {
        prev?.dispose();
        return null;
      });
    };
  }, [svg, gl, invalidate]);

  useFrame((state) => {
    const m = meshRef.current;
    if (!m) return;
    if (motion) {
      m.rotation.y = Math.sin(state.clock.elapsedTime * 0.45) * 0.05;
      m.rotation.x = Math.cos(state.clock.elapsedTime * 0.38) * 0.025;
      invalidate();
    } else {
      m.rotation.x = 0;
      m.rotation.y = 0;
    }
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[planeW, planeH, 1, 1]} />
      <meshStandardMaterial
        map={map}
        roughness={0.42}
        metalness={0.06}
        side={THREE.DoubleSide}
        transparent
        opacity={map ? 1 : 0}
      />
    </mesh>
  );
}
