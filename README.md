## Interactive Mathematical Explorer

An interactive visualization of the equation

```
z_{n+1} = z_n^2 + c
```

using React, PixiJS, and Next.js.

Where:

- z starts at 0 (z₀ = 0)
- c is a complex number representing each point on the grid
- Each point c has the form (x + yi) where x is the horizontal position and y is the vertical position

## Features

- Interactive visualization of the Mandelbrot set
- Pan and Zoom controls
- Configurable maximum iterations

## Installation

1. Clone this repository:

```bash
git https://github.com/sandeepdreddy/data-viz-ncl.git
cd data-viz-ncl
```

2. Install dependencies:

```bash
npm install
# or
yarn
```

3. Run the development server:

```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the visualization.

## Dependencies

- Next.js - React framework
- React - UI library
- PixiJS - WebGL-based rendering library for high-performance graphics

## How It Works

The visualization:

1. Maps each pixel to a point in the complex plane from (-2,-2) to (2,2)
2. For each point, computes the iterative equation z\_{n+1} = z_n^2 + c starting with z₀ = 0
3. Determines if the sequence remains bounded or escapes

## Performance Considerations

- Batch processing with progress updates
- Hardware acceleration via PixiJS and WebGL
