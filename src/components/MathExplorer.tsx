"use client";

// import React, { useEffect, useRef, useState } from "react";
// import * as PIXI from "pixi.js";

// const MathExplorer = () => {
//   const canvasRef = useRef(null);
//   const appRef = useRef(null);
//   const [isRendering, setIsRendering] = useState(false);
//   const [progress, setProgress] = useState(0);
//   const [iterations, setIterations] = useState(100);
//   const [resolution, setResolution] = useState(500);

//   useEffect(() => {
//     // Create a new PixiJS application
//     const app = new PIXI.Application({
//       width: 800,
//       height: 800,
//       backgroundColor: 0x000000,
//       antialias: true,
//     });

//     // Add the canvas to the DOM
//     if (canvasRef.current) {
//       canvasRef.current.appendChild(app.view);
//       appRef.current = app;

//       // Create the texture to display the mandelbrot set
//       const graphics = new PIXI.Graphics();
//       app.stage.addChild(graphics);

//       // Initial render
//       renderMandelbrot(graphics, resolution, iterations);
//     }

//     // Cleanup
//     return () => {
//       if (appRef.current) {
//         appRef.current.destroy(true);
//       }
//     };
//   }, []);

//   const renderMandelbrot = (graphics, resolution, maxIterations) => {
//     setIsRendering(true);
//     setProgress(0);

//     // Clear the graphics
//     graphics.clear();

//     const width = 800;
//     const height = 800;
//     const pixelSize = width / resolution;

//     // Create a temporary canvas to draw the Mandelbrot set
//     const canvas = document.createElement("canvas");
//     canvas.width = width;
//     canvas.height = height;
//     const ctx = canvas.getContext("2d");
//     const imageData = ctx.createImageData(width, height);

//     // Batch size for UI updates
//     const batchSize = Math.floor(resolution / 20);
//     let processedRows = 0;

//     // Schedule the computation using requestAnimationFrame to avoid blocking the UI
//     const processRow = (y) => {
//       if (y >= resolution) {
//         // Finish rendering
//         ctx.putImageData(imageData, 0, 0);
//         const texture = PIXI.Texture.from(canvas);
//         graphics.clear();
//         graphics.beginTextureFill({ texture });
//         graphics.drawRect(0, 0, width, height);
//         graphics.endFill();

//         setIsRendering(false);
//         return;
//       }

//       for (let x = 0; x < resolution; x++) {
//         // Map pixel coordinates to the complex plane
//         const real = (x / resolution) * 4 - 2;
//         const imag = (y / resolution) * 4 - 2;

//         // Calculate the color for this pixel
//         const color = calculateMandelbrotPoint(real, imag, maxIterations);

//         // Scale the pixel to the canvas size
//         for (let py = 0; py < pixelSize; py++) {
//           for (let px = 0; px < pixelSize; px++) {
//             const pixelIndex =
//               4 *
//               ((Math.floor(y * pixelSize) + py) * width +
//                 (Math.floor(x * pixelSize) + px));
//             imageData.data[pixelIndex] = color.r;
//             imageData.data[pixelIndex + 1] = color.g;
//             imageData.data[pixelIndex + 2] = color.b;
//             imageData.data[pixelIndex + 3] = 255; // Alpha
//           }
//         }
//       }

//       processedRows++;
//       if (processedRows % batchSize === 0 || y === resolution - 1) {
//         setProgress(Math.floor((processedRows / resolution) * 100));
//         ctx.putImageData(imageData, 0, 0);
//       }

//       // Process the next row
//       requestAnimationFrame(() => processRow(y + 1));
//     };

//     // Start processing
//     processRow(0);
//   };

//   const calculateMandelbrotPoint = (real, imag, maxIterations) => {
//     let zr = 0;
//     let zi = 0;
//     let n = 0;

//     while (n < maxIterations) {
//       // z = z^2 + c
//       const zr2 = zr * zr;
//       const zi2 = zi * zi;

//       // Check if the point is escaping
//       if (zr2 + zi2 > 4) {
//         break;
//       }

//       zi = 2 * zr * zi + imag;
//       zr = zr2 - zi2 + real;
//       n++;
//     }

//     // Coloring based on whether the sequence escapes
//     if (n === maxIterations) {
//       // Point is in the set (bounded)
//       return { r: 0, g: 0, b: 0 };
//     } else {
//       // Point is outside the set (escaping)
//       // Create a smooth color gradient based on escape speed
//       const hue = (n / maxIterations) * 360;
//       return hslToRgb(hue, 0.8, 0.5);
//     }
//   };

//   const hslToRgb = (h, s, l) => {
//     let r, g, b;

//     if (s === 0) {
//       r = g = b = l;
//     } else {
//       const hue2rgb = (p, q, t) => {
//         if (t < 0) t += 1;
//         if (t > 1) t -= 1;
//         if (t < 1 / 6) return p + (q - p) * 6 * t;
//         if (t < 1 / 2) return q;
//         if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
//         return p;
//       };

//       const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
//       const p = 2 * l - q;
//       r = hue2rgb(p, q, (h / 360 + 1 / 3) % 1);
//       g = hue2rgb(p, q, (h / 360) % 1);
//       b = hue2rgb(p, q, (h / 360 - 1 / 3) % 1);
//     }

//     return {
//       r: Math.round(r * 255),
//       g: Math.round(g * 255),
//       b: Math.round(b * 255),
//     };
//   };

//   const handleResolutionChange = (e) => {
//     setResolution(parseInt(e.target.value, 10));
//   };

//   const handleIterationsChange = (e) => {
//     setIterations(parseInt(e.target.value, 10));
//   };

//   const handleRerender = () => {
//     if (appRef.current && !isRendering) {
//       const graphics = appRef.current.stage.children[0];
//       renderMandelbrot(graphics, resolution, iterations);
//     }
//   };

//   return (
//     <div className="flex flex-col items-center p-4 bg-gray-100 min-h-screen">
//       <h1 className="text-3xl font-bold mb-4">Mandelbrot Set Visualization</h1>
//       <p className="text-lg mb-4">
//         Equation: z_n + 1 = z_n^2 + c where z_0 = 0
//       </p>

//       <div className="bg-white p-4 rounded-lg shadow-lg">
//         <div ref={canvasRef} className="border border-gray-300 rounded"></div>

//         {isRendering && (
//           <div className="mt-4">
//             <div className="w-full bg-gray-200 rounded-full h-4">
//               <div
//                 className="bg-blue-600 h-4 rounded-full"
//                 style={{ width: `${progress}%` }}
//               ></div>
//             </div>
//             <p className="text-center mt-2">Rendering: {progress}%</p>
//           </div>
//         )}

//         <div className="mt-4 grid grid-cols-2 gap-4">
//           <div>
//             <label className="block mb-2">
//               Resolution: {resolution}x{resolution}
//             </label>
//             <input
//               type="range"
//               min="100"
//               max="1000"
//               step="50"
//               value={resolution}
//               onChange={handleResolutionChange}
//               className="w-full"
//               disabled={isRendering}
//             />
//           </div>
//           <div>
//             <label className="block mb-2">Max Iterations: {iterations}</label>
//             <input
//               type="range"
//               min="10"
//               max="1000"
//               step="10"
//               value={iterations}
//               onChange={handleIterationsChange}
//               className="w-full"
//               disabled={isRendering}
//             />
//           </div>
//         </div>

//         <button
//           className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
//           onClick={handleRerender}
//           disabled={isRendering}
//         >
//           {isRendering ? "Rendering..." : "Render Mandelbrot Set"}
//         </button>
//       </div>

//       <div className="mt-8 max-w-2xl">
//         <h2 className="text-xl font-bold mb-2">About this Visualization</h2>
//         <p className="mb-2">
//           This is a visualization of the Mandelbrot set, which is the set of
//           complex numbers c for which the sequence z_n + 1 = z_n^2 + c (starting
//           with z_0 = 0) remains bounded.
//         </p>
//         <p className="mb-2">
//           - Dark points (black): The sequence stays bounded (part of the
//           Mandelbrot set)
//         </p>
//         <p className="mb-2">
//           - Colored points: The sequence escapes to infinity (not part of the
//           set), with colors indicating how quickly it escapes
//         </p>
//         <p>
//           The visualization spans from (-2,-2) to (2,2) in the complex plane,
//           with the horizontal axis representing the real component and the
//           vertical axis representing the imaginary component.
//         </p>
//       </div>
//     </div>
//   );
// };

// export default MathExplorer;

/** No Grid **/

import { useEffect, useRef, useState } from "react";
import * as PIXI from "pixi.js";
import styles from "../styles/MathExplorer.module.css";

interface Position {
  x: number;
  y: number;
}

const MathExplorer: React.FC = () => {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [app, setApp] = useState<PIXI.Application | null>(null);
  const [mesh, setMesh] = useState<PIXI.Mesh | null>(null);

  // Mandelbrot parameters
  const [viewParams, setViewParams] = useState({
    // xMin: -2,
    // xMax: 2,
    // yMin: -2,
    // yMax: 2,
    // maxIterations: 100,
    xMin: -2.7,
    xMax: -0.9, // Proper horizontal range for classic Mandelbrot
    yMin: -2.7,
    yMax: -0.9, // Adjusted Y range to account for aspect ratio
    maxIterations: 100,
  });

  // Pan and zoom state
  const isDraggingRef = useRef(false);
  const lastPosRef = useRef<Position>({ x: 0, y: 0 });

  useEffect(() => {
    if (!canvasContainerRef.current) return;

    // Clean up any existing PIXI application
    if (app) {
      app.destroy(true);
    }

    // Calculate canvas size
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

    // Create a shader for the Mandelbrot set
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
          // Inside the Mandelbrot set (bounded)
          gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        } else {
          // Outside the Mandelbrot set (unbounded)
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

    // Create a quad to render the shader
    const geometry = new PIXI.Geometry()
      .addAttribute("aVertexPosition", [-1, -1, 1, -1, 1, 1, -1, 1], 2)
      .addIndex([0, 1, 2, 0, 2, 3]);

    // Create a shader program
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

    // Create a mesh
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

  // Update uniforms when view parameters change
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

  // Event handlers setup
  useEffect(() => {
    if (!app || !app.view) return;

    // Function to zoom
    const zoom = (factor: number, centerX: number, centerY: number) => {
      const width = app.view.width;
      const height = app.view.height;

      // Calculate center point in complex plane
      const centerReal =
        viewParams.xMin +
        ((viewParams.xMax - viewParams.xMin) * centerX) / width;
      const centerImag =
        viewParams.yMin +
        ((viewParams.yMax - viewParams.yMin) * centerY) / height;

      // Adjust bounds
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

    // Function to pan
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

    // Mouse events for panning
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

    // Touch events for mobile devices
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

    // Handle window resize
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
    // zoom(1, 0, 0);

    // Cleanup event listeners
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

  // Button handlers
  const handleZoomIn = () => {
    if (!app) return;
    const width = app.view.width;
    const height = app.view.height;
    const factor = 0.5;
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
    const factor = 2.0;
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
    <div className={styles.container}>
      <div className={styles.canvasContainer} ref={canvasContainerRef}></div>
      <div className={styles.info}>
        <h3>Mandelbrot Set: z_(n+1) = z_n² + c</h3>
        <p>Pan: Click and drag</p>
        <p>Zoom: Mouse wheel or buttons</p>
        <div>Iterations: {viewParams.maxIterations}</div>
        <div>
          Position: ({viewParams.xMin.toFixed(2)},{viewParams.yMin.toFixed(2)})
          to ({viewParams.xMax.toFixed(2)},{viewParams.yMax.toFixed(2)})
        </div>
      </div>
      <div className={styles.controls}>
        <button onClick={handleZoomIn}>Zoom In</button>
        <button onClick={handleZoomOut}>Zoom Out</button>
        <button onClick={handleReset}>Reset View</button>
        <button onClick={handleIncreaseIterations}>More Iterations</button>
        <button onClick={handleDecreaseIterations}>Less Iterations</button>
      </div>
    </div>
  );
};

export default MathExplorer;
