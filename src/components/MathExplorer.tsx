"use client";

import { useEffect, useRef, useState } from "react";
import * as PIXI from "pixi.js";

interface Position {
  x: number;
  y: number;
}

const MathExplorer: React.FC = () => {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [app, setApp] = useState<PIXI.Application | null>(null);
  const [mesh, setMesh] = useState<PIXI.Mesh | null>(null);

  const [viewParams, setViewParams] = useState({
    // xMin: -2,
    // xMax: 2,
    // yMin: -2,
    // yMax: 2,
    // maxIterations: 100,
    xMin: -2.7,
    xMax: -0.9,
    yMin: -2.7,
    yMax: -0.9,
    maxIterations: 100,
  });

  const isDraggingRef = useRef(false);
  const lastPosRef = useRef<Position>({ x: 0, y: 0 });

  useEffect(() => {
    if (!canvasContainerRef.current) return;

    if (app) {
      app.destroy(true);
    }

    const containerWidth = canvasContainerRef.current.clientWidth;
    const containerHeight = canvasContainerRef.current.clientHeight;
    const size = Math.min(containerWidth, containerHeight);
    console.log(size);

    // Initialize PIXI
    const pixiApp = new PIXI.Application({
      width: size,
      height: size,
      backgroundColor: 0x000000,
      resolution: window.devicePixelRatio || 1,
      antialias: true,
    });

    canvasContainerRef.current.appendChild(pixiApp.view);
    setApp(pixiApp);

    const fragmentShader = `
      precision highp float;

      uniform vec2 uResolution;
      uniform vec2 uMin;
      uniform vec2 uMax;
      uniform float uMaxIterations;

      vec3 hsv2rgb(vec3 c) {
        vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
        vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
        return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / uResolution.xy;
        vec2 c = mix(uMin, uMax, uv);
        

        vec2 z = vec2(0.0, 0.0);
        float iteration = 0.0;

        for (float i = 0.0; i < 1000.0; i++) {
          if (i >= uMaxIterations) break;

          // z = z^2 + c
          vec2 zSquared = vec2(
            z.x * z.x - z.y * z.y,
            2.0 * z.x * z.y
          );
          z = zSquared + c;

          // Check if |z| > 2
          if (dot(z, z) > 4.0) {
            break;
          }

          iteration++;
        }

        if (iteration >= uMaxIterations) {
          // Inside the set (bounded)
          gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        } else {
          // Outside the set (unbounded)
          float smooth_value = iteration + 1.0 - log(log(length(z))) / log(2.0);
          smooth_value = smooth_value / uMaxIterations;

          // Color scheme
          vec3 color = hsv2rgb(vec3(
            0.5 + 0.5 * cos(smooth_value * 3.0),
            0.8,
            mix(0.0, 1.0, smooth_value)
          ));

          gl_FragColor = vec4(color, 1.0);
        }
      }
    `;

    const geometry = new PIXI.Geometry()
      .addAttribute("aVertexPosition", [-1, -1, 1, -1, 1, 1, -1, 1], 2)
      .addIndex([0, 1, 2, 0, 2, 3]);

    const shader = PIXI.Shader.from(
      `
      precision mediump float;
      attribute vec2 aVertexPosition;

      void main() {
        gl_Position = vec4(aVertexPosition, 0.0, 1.0);
      }
    `,
      fragmentShader,
      {
        uResolution: new Float32Array([size, size]),
        uMin: new Float32Array([viewParams.xMin, viewParams.yMin]),
        uMax: new Float32Array([viewParams.xMax, viewParams.yMax]),
        uMaxIterations: viewParams.maxIterations,
      }
    );

    const meshObject = new PIXI.Mesh(geometry, shader);
    pixiApp.stage.addChild(meshObject);
    setMesh(meshObject);

    // Cleanup function
    return () => {
      if (pixiApp && pixiApp.view.parentNode) {
        pixiApp.view.parentNode.removeChild(pixiApp.view);
      }
      pixiApp.destroy(true);
    };
  }, []);

  useEffect(() => {
    if (!mesh) return;

    mesh.shader.uniforms.uMin = new Float32Array([
      viewParams.xMin,
      viewParams.yMin,
    ]);
    mesh.shader.uniforms.uMax = new Float32Array([
      viewParams.xMax,
      viewParams.yMax,
    ]);
    mesh.shader.uniforms.uMaxIterations = viewParams.maxIterations;
  }, [mesh, viewParams]);

  useEffect(() => {
    if (!app || !app.view) return;

    const zoom = (factor: number, centerX: number, centerY: number) => {
      const width = app.view.width;
      const height = app.view.height;

      const centerReal =
        viewParams.xMin +
        ((viewParams.xMax - viewParams.xMin) * centerX) / width;
      const centerImag =
        viewParams.yMin +
        ((viewParams.yMax - viewParams.yMin) * centerY) / height;

      const newWidth = (viewParams.xMax - viewParams.xMin) * factor;
      const newHeight = (viewParams.yMax - viewParams.yMin) * factor;

      setViewParams({
        ...viewParams,
        xMin: centerReal - newWidth / 2,
        xMax: centerReal + newWidth / 2,
        yMin: centerImag - newHeight / 2,
        yMax: centerImag + newHeight / 2,
      });
    };

    const pan = (dx: number, dy: number) => {
      const scaleX = (viewParams.xMax - viewParams.xMin) / app.view.width;
      const scaleY = (viewParams.yMax - viewParams.yMin) / app.view.height;

      setViewParams({
        ...viewParams,
        xMin: viewParams.xMin - dx * scaleX,
        xMax: viewParams.xMax - dx * scaleX,
        yMin: viewParams.yMin - dy * scaleY,
        yMax: viewParams.yMax - dy * scaleY,
      });
    };

    // Mouse wheel event for zooming
    // const handleWheel = (e: WheelEvent) => {
    //   e.preventDefault();
    //   const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9;
    //   zoom(zoomFactor, e.clientX, e.clientY);
    // };

    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      lastPosRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingRef.current) {
        const dx = e.clientX - lastPosRef.current.x;
        const dy = e.clientY - lastPosRef.current.y;
        pan(-dx, -dy);
        lastPosRef.current = { x: e.clientX, y: e.clientY };
      }
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    const handleMouseLeave = () => {
      isDraggingRef.current = false;
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
        lastPosRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isDraggingRef.current && e.touches.length === 1) {
        const dx = e.touches[0].clientX - lastPosRef.current.x;
        const dy = e.touches[0].clientY - lastPosRef.current.y;
        pan(-dx, -dy);
        lastPosRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
      }
    };

    const handleTouchEnd = () => {
      isDraggingRef.current = false;
    };

    // Add event listeners

    app.view.addEventListener("mousedown", handleMouseDown);
    app.view.addEventListener("mousemove", handleMouseMove);
    app.view.addEventListener("mouseup", handleMouseUp);
    app.view.addEventListener("mouseleave", handleMouseLeave);
    app.view.addEventListener("touchstart", handleTouchStart);
    app.view.addEventListener("touchmove", handleTouchMove);
    app.view.addEventListener("touchend", handleTouchEnd);
    // app.view.addEventListener("wheel", handleWheel);

    const handleResize = () => {
      if (!canvasContainerRef.current || !app) return;

      const containerWidth = canvasContainerRef.current.clientWidth;
      const containerHeight = canvasContainerRef.current.clientHeight;
      const size = Math.min(containerWidth, containerHeight);

      app.renderer.resize(size, size);

      if (mesh) {
        mesh.shader.uniforms.uResolution = new Float32Array([size, size]);
      }
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      if (!app.view) return;

      // app.view.removeEventListener("wheel", handleWheel);
      app.view.removeEventListener("mousedown", handleMouseDown);
      app.view.removeEventListener("mousemove", handleMouseMove);
      app.view.removeEventListener("mouseup", handleMouseUp);
      app.view.removeEventListener("mouseleave", handleMouseLeave);
      app.view.removeEventListener("touchstart", handleTouchStart);
      app.view.removeEventListener("touchmove", handleTouchMove);
      app.view.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("resize", handleResize);
    };
  }, [app, mesh, viewParams]);

  const handleZoomIn = () => {
    if (!app) return;
    const width = app.view.width;
    const height = app.view.height;
    const factor = 0.9;
    const centerX = width / 2;
    const centerY = height / 2;

    const centerReal =
      viewParams.xMin + ((viewParams.xMax - viewParams.xMin) * centerX) / width;
    const centerImag =
      viewParams.yMin +
      ((viewParams.yMax - viewParams.yMin) * centerY) / height;

    const newWidth = (viewParams.xMax - viewParams.xMin) * factor;
    const newHeight = (viewParams.yMax - viewParams.yMin) * factor;

    setViewParams({
      ...viewParams,
      xMin: centerReal - newWidth / 2,
      xMax: centerReal + newWidth / 2,
      yMin: centerImag - newHeight / 2,
      yMax: centerImag + newHeight / 2,
    });
  };

  const handleZoomOut = () => {
    if (!app) return;
    const width = app.view.width;
    const height = app.view.height;
    const factor = 1.1;
    const centerX = width / 2;
    const centerY = height / 2;

    const centerReal =
      viewParams.xMin + ((viewParams.xMax - viewParams.xMin) * centerX) / width;
    const centerImag =
      viewParams.yMin +
      ((viewParams.yMax - viewParams.yMin) * centerY) / height;

    const newWidth = (viewParams.xMax - viewParams.xMin) * factor;
    const newHeight = (viewParams.yMax - viewParams.yMin) * factor;

    setViewParams({
      ...viewParams,
      xMin: centerReal - newWidth / 2,
      xMax: centerReal + newWidth / 2,
      yMin: centerImag - newHeight / 2,
      yMax: centerImag + newHeight / 2,
    });
  };

  const handleReset = () => {
    setViewParams({
      xMin: -2,
      xMax: 2,
      yMin: -2,
      yMax: 2,
      maxIterations: 100,
    });
  };

  const handleIncreaseIterations = () => {
    setViewParams({
      ...viewParams,
      maxIterations: Math.min(1000, viewParams.maxIterations * 2),
    });
  };

  const handleDecreaseIterations = () => {
    setViewParams({
      ...viewParams,
      maxIterations: Math.max(10, viewParams.maxIterations / 2),
    });
  };

  return (
    // <div className={styles.container}>
    //   <div className={styles.canvasContainer} ref={canvasContainerRef}></div>
    //   <div className={styles.info}>
    //     <h3>Set: z_(n+1) = z_n² + c</h3>
    //     <p>Pan: Click and drag</p>
    //     <p>Zoom: Mouse wheel or buttons</p>
    //     <div>Iterations: {viewParams.maxIterations}</div>
    //     <div>
    //       Position: ({viewParams.xMin.toFixed(2)},{viewParams.yMin.toFixed(2)})
    //       to ({viewParams.xMax.toFixed(2)},{viewParams.yMax.toFixed(2)})
    //     </div>
    //   </div>
    //   <div className={styles.controls}>
    //     <button onClick={handleZoomIn}>Zoom In</button>
    //     <button onClick={handleZoomOut}>Zoom Out</button>
    //     <button onClick={handleReset}>Reset View</button>
    //     <button onClick={handleIncreaseIterations}>More Iterations</button>
    //     <button onClick={handleDecreaseIterations}>Less Iterations</button>
    //   </div>
    // </div>
    <div className="relative w-screen h-screen overflow-hidden">
      <div className="relative w-full h-full" ref={canvasContainerRef}></div>

      <div className="absolute top-4 left-4 p-4 rounded-md text-white font-sans max-w-[300px]">
        <p className="font-extrabold">To Pan: Click and Drag</p>
        <div>
          Current Position: ({viewParams.xMin.toFixed(2)},
          {viewParams.yMin.toFixed(2)}) to ({viewParams.xMax.toFixed(2)},
          {viewParams.yMax.toFixed(2)})
        </div>
      </div>
      <div className="absolute bottom-4 left-4 p-4 rounded-md">
        <button
          onClick={handleZoomIn}
          className="m-2 px-5 py-2 bg-blue-700 text-white border-none rounded cursor-pointer hover:bg-blue-600"
        >
          Zoom In
        </button>
        <button
          onClick={handleZoomOut}
          className="m-2 px-5 py-2 bg-blue-700 text-white border-none rounded cursor-pointer hover:bg-blue-600"
        >
          Zoom Out
        </button>
        <button
          onClick={handleReset}
          className="m-2 px-5 py-2 bg-blue-700 text-white border-none rounded cursor-pointer hover:bg-blue-600"
        >
          Reset View
        </button>
        <button
          onClick={handleIncreaseIterations}
          className="m-2 px-5 py-2 bg-blue-700 text-white border-none rounded cursor-pointer hover:bg-blue-600"
        >
          More Iterations
        </button>
        <button
          onClick={handleDecreaseIterations}
          className="m-2 px-5 py-2 bg-blue-700 text-white border-none rounded cursor-pointer hover:bg-blue-600"
        >
          Less Iterations
        </button>
      </div>
    </div>
  );
};

export default MathExplorer;
