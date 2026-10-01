import React, { useEffect, useRef } from 'react';

export const BackgroundCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', {
      alpha: false,
      antialias: true,
      powerPreference: 'high-performance',
    });

    if (!gl) {
      console.warn('WebGL not supported for background mesh, using CSS fallback');
      return;
    }

    // Vertex shader
    const vsSource = `
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    // Fragment shader: Abstract Liquid Silk & Gradient Mesh
    // Recreates the deep purple-indigo flowing liquid cloth folds from reference image
    const fsSource = `
      precision highp float;
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform vec2 u_mouse;

      // Smooth cosine palette and domain-warped waves
      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);

        // Slow, luxurious fluid time
        float t = u_time * 0.22;

        // Mouse influence
        vec2 m = (u_mouse - 0.5) * 0.35;

        // Domain warping for organic liquid cloth folds
        vec2 q = p;
        q.x += sin(p.y * 1.7 + t * 0.75 + m.x) * 0.55;
        q.y += cos(p.x * 1.4 - t * 0.6 + m.y) * 0.55;

        vec2 r = q;
        r.x += sin(q.y * 2.1 - t * 0.9 + m.y * 0.6) * 0.42;
        r.y += cos(q.x * 1.9 + t * 0.85 + m.x * 0.6) * 0.42;

        // Layered undulating wave heights
        float wave1 = sin(r.x * 1.1 + r.y * 1.7 + t * 0.95);
        float wave2 = cos(r.x * 1.8 - r.y * 1.3 - t * 0.7);
        float wave3 = sin(length(r + vec2(sin(t * 0.45) * 0.4, cos(t * 0.35) * 0.4)) * 2.2 - t * 1.1);

        float fluid = wave1 * 0.48 + wave2 * 0.34 + wave3 * 0.18;
        float fold = smoothstep(-0.55, 0.75, fluid);
        float fold2 = smoothstep(-0.25, 0.85, wave2);

        // Color palette sampled directly from image.png:
        // Deep obsidian midnight base: #04020e
        vec3 c_deep = vec3(0.018, 0.009, 0.055);
        // Rich dark velvet purple: #0e052c
        vec3 c_velvet = vec3(0.058, 0.022, 0.175);
        // Royal purple-indigo: #1e0c5c
        vec3 c_royal = vec3(0.12, 0.048, 0.36);
        // Vibrant electric violet crest: #37158f
        vec3 c_crest = vec3(0.22, 0.085, 0.56);
        // Silky luminous sheen: #4f1dbf
        vec3 c_sheen = vec3(0.31, 0.12, 0.75);

        // Diagonal liquid mesh gradient blend
        float diag = uv.x * 0.4 + uv.y * 0.6;
        vec3 color = mix(c_deep, c_velvet, smoothstep(0.05, 0.65, diag + fold * 0.35));
        color = mix(color, c_royal, fold * 0.85);
        color = mix(color, c_crest, fold2 * 0.68);

        // Liquid satin specular highlights along the fluid crests
        float highlight = pow(max(0.0, fluid * 0.5 + 0.5), 3.5) * 0.55;
        color += c_sheen * highlight;

        // Subtle dark vignette to keep typography crystal clear
        float vignette = 1.0 - length((uv - 0.5) * 1.1) * 0.42;
        color *= clamp(vignette, 0.4, 1.0);

        gl_FragColor = vec4(color, 1.0);
      }
    `;

    // Compile shader helper
    const compileShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertexShader = compileShader(gl.VERTEX_SHADER, vsSource);
    const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fsSource);

    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      return;
    }

    // Full screen quad
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1,
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
    const timeLocation = gl.getUniformLocation(program, 'u_time');
    const mouseLocation = gl.getUniformLocation(program, 'u_mouse');

    let animationFrameId: number;
    let startTime = performance.now();
    let mouse = { x: 0.5, y: 0.5 };
    let targetMouse = { x: 0.5, y: 0.5 };

    const handleMouseMove = (e: MouseEvent) => {
      targetMouse.x = e.clientX / window.innerWidth;
      targetMouse.y = 1.0 - e.clientY / window.innerHeight;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = Math.floor(window.innerWidth * dpr);
      const height = Math.floor(window.innerHeight * dpr);
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
    };
    window.addEventListener('resize', resize);
    resize();

    const render = (now: number) => {
      const elapsedTime = (now - startTime) * 0.001;

      // Smooth mouse lerp
      mouse.x += (targetMouse.x - mouse.x) * 0.05;
      mouse.y += (targetMouse.y - mouse.y) * 0.05;

      gl.useProgram(program);
      gl.enableVertexAttribArray(positionLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      gl.uniform1f(timeLocation, elapsedTime);
      gl.uniform2f(mouseLocation, mouse.x, mouse.y);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (gl) {
        gl.deleteProgram(program);
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
        gl.deleteBuffer(positionBuffer);
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#03010b]">
      {/* Dynamic WebGL Liquid Silk Gradient Mesh */}
      <canvas
        ref={canvasRef}
        className="w-full h-full object-cover block pointer-events-none"
      />

      {/* Subtle organic noise texture overlay for analog silk sheen depth */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035] mix-blend-overlay"
        style={{
          backgroundImage: `radial-gradient(rgba(255,255,255,0.4) 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }}
      />
    </div>
  );
};
