"use client"

import { useEffect, useRef, useState } from "react"
import * as THREE from "three"

interface ThreeHeroGlobeProps {
  className?: string
}

export function ThreeHeroGlobe({ className = "" }: ThreeHeroGlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isWebGLAvailable, setIsWebGLAvailable] = useState(true)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // 1. Scene, Camera, Renderer Setup
    const scene = new THREE.Scene()

    const width = container.clientWidth || 600
    const height = container.clientHeight || 450

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
    camera.position.z = 24
    camera.position.y = 1

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      })
    } catch {
      setIsWebGLAvailable(false)
      return
    }

    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    container.appendChild(renderer.domElement)

    // 2. Scene Groups
    const mainGroup = new THREE.Group()
    scene.add(mainGroup)

    // 3. Central Core: Inner Geodesic Sphere
    const coreGeo = new THREE.IcosahedronGeometry(4.2, 2)
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      wireframe: true,
      transparent: true,
      opacity: 0.22,
    })
    const coreMesh = new THREE.Mesh(coreGeo, coreMat)
    mainGroup.add(coreMesh)

    // Inner glowing sphere
    const innerGeo = new THREE.SphereGeometry(3.6, 24, 24)
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x4f46e5,
      wireframe: false,
      transparent: true,
      opacity: 0.08,
    })
    const innerMesh = new THREE.Mesh(innerGeo, innerMat)
    mainGroup.add(innerMesh)

    // 4. Outer Orbital Rings
    const ringGroup = new THREE.Group()
    mainGroup.add(ringGroup)

    const createRing = (radius: number, color: number, opacity: number, rotX: number, rotY: number) => {
      const curve = new THREE.EllipseCurve(0, 0, radius, radius, 0, 2 * Math.PI, false, 0)
      const points = curve.getPoints(80)
      const ringGeo = new THREE.BufferGeometry().setFromPoints(points.map((p) => new THREE.Vector3(p.x, p.y, 0)))
      const ringMat = new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity,
      })
      const ring = new THREE.Line(ringGeo, ringMat)
      ring.rotation.x = rotX
      ring.rotation.y = rotY
      return ring
    }

    const ring1 = createRing(6.8, 0x6366f1, 0.45, Math.PI / 3, Math.PI / 6)
    const ring2 = createRing(7.8, 0x06b6d4, 0.35, -Math.PI / 4, Math.PI / 4)
    const ring3 = createRing(8.8, 0xa855f7, 0.25, Math.PI / 2.2, -Math.PI / 8)
    ringGroup.add(ring1, ring2, ring3)

    // 5. Named AI Engine Nodes
    const AI_NODES = [
      { name: "ChatGPT", color: 0x10a37f, pos: new THREE.Vector3(4.8, 2.2, 2.5) },
      { name: "Gemini", color: 0x3b82f6, pos: new THREE.Vector3(-4.5, 2.8, -1.8) },
      { name: "Perplexity", color: 0xa855f7, pos: new THREE.Vector3(3.5, -3.2, 2.8) },
      { name: "Claude", color: 0xf59e0b, pos: new THREE.Vector3(-3.8, -2.5, -3.2) },
      { name: "Copilot", color: 0x06b6d4, pos: new THREE.Vector3(1.2, 4.8, -3.0) },
      { name: "Grok", color: 0xef4444, pos: new THREE.Vector3(-2.2, 3.5, 4.0) },
    ]

    const nodeMeshes: THREE.Mesh[] = []
    const nodeHalos: THREE.Mesh[] = []

    AI_NODES.forEach((node) => {
      // Solid node core
      const nodeGeo = new THREE.SphereGeometry(0.32, 16, 16)
      const nodeMat = new THREE.MeshBasicMaterial({ color: node.color })
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat)
      nodeMesh.position.copy(node.pos)
      mainGroup.add(nodeMesh)
      nodeMeshes.push(nodeMesh)

      // Outer glow halo
      const haloGeo = new THREE.SphereGeometry(0.65, 16, 16)
      const haloMat = new THREE.MeshBasicMaterial({
        color: node.color,
        transparent: true,
        opacity: 0.25,
      })
      const haloMesh = new THREE.Mesh(haloGeo, haloMat)
      haloMesh.position.copy(node.pos)
      mainGroup.add(haloMesh)
      nodeHalos.push(haloMesh)

      // Connection line from center to node
      const lineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), node.pos])
      const lineMat = new THREE.LineBasicMaterial({
        color: node.color,
        transparent: true,
        opacity: 0.28,
      })
      const line = new THREE.Line(lineGeo, lineMat)
      mainGroup.add(line)
    })

    // Constellation lines connecting consecutive nodes
    const constellationPoints = AI_NODES.map((n) => n.pos)
    const constellationGeo = new THREE.BufferGeometry().setFromPoints([...constellationPoints, constellationPoints[0]])
    const constellationMat = new THREE.LineBasicMaterial({
      color: 0x6366f1,
      transparent: true,
      opacity: 0.2,
    })
    const constellationLine = new THREE.Line(constellationGeo, constellationMat)
    mainGroup.add(constellationLine)

    // 6. Ambient Particle Cloud (Data flow pulses)
    const particleCount = 280
    const particleGeo = new THREE.BufferGeometry()
    const particlePositions = new Float32Array(particleCount * 3)
    const particleScales = new Float32Array(particleCount)

    for (let i = 0; i < particleCount; i++) {
      const radius = 5.0 + Math.random() * 8.5
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(Math.random() * 2 - 1)

      particlePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      particlePositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      particlePositions[i * 3 + 2] = radius * Math.cos(phi)
      particleScales[i] = Math.random()
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3))

    // Canvas particle texture for smooth soft circles
    const canvas = document.createElement("canvas")
    canvas.width = 32
    canvas.height = 32
    const ctx = canvas.getContext("2d")
    if (ctx) {
      const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16)
      grad.addColorStop(0, "rgba(255, 255, 255, 1)")
      grad.addColorStop(0.4, "rgba(99, 102, 241, 0.8)")
      grad.addColorStop(1, "rgba(99, 102, 241, 0)")
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, 32, 32)
    }
    const particleTexture = new THREE.CanvasTexture(canvas)

    const particleMat = new THREE.PointsMaterial({
      size: 0.28,
      map: particleTexture,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })

    const particles = new THREE.Points(particleGeo, particleMat)
    mainGroup.add(particles)

    // 7. Mouse / Touch Parallax Interaction
    let mouseX = 0
    let mouseY = 0
    let targetRotationX = 0
    let targetRotationY = 0

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width - 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5
      mouseX = x * 1.8
      mouseY = y * 1.8
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0]
        const rect = container.getBoundingClientRect()
        const x = (touch.clientX - rect.left) / rect.width - 0.5
        const y = (touch.clientY - rect.top) / rect.height - 0.5
        mouseX = x * 1.5
        mouseY = y * 1.5
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("touchmove", handleTouchMove, { passive: true })

    // 8. Responsive Resize Handler
    const handleResize = () => {
      if (!container) return
      const newWidth = container.clientWidth
      const newHeight = container.clientHeight
      if (newWidth === 0 || newHeight === 0) return

      camera.aspect = newWidth / newHeight
      camera.updateProjectionMatrix()
      renderer.setSize(newWidth, newHeight)
    }

    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(container)

    // 9. Animation Loop
    let animationFrameId: number
    let clock = new THREE.Clock()

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)

      const elapsedTime = clock.getElapsedTime()

      // Continuous slow rotation
      mainGroup.rotation.y += 0.003
      mainGroup.rotation.x += 0.0008

      // Rotate individual orbital rings
      ring1.rotation.z += 0.004
      ring2.rotation.z -= 0.003
      ring3.rotation.z += 0.002

      // Core pulsing
      const pulse = Math.sin(elapsedTime * 2) * 0.06 + 1
      coreMesh.scale.set(pulse, pulse, pulse)

      // Halo breathing effect
      nodeHalos.forEach((halo, index) => {
        const hPulse = Math.sin(elapsedTime * 3 + index * 1.2) * 0.2 + 1
        halo.scale.set(hPulse, hPulse, hPulse)
      })

      // Particle subtle wave drift
      particles.rotation.y = elapsedTime * 0.015
      particles.rotation.x = Math.sin(elapsedTime * 0.2) * 0.05

      // Smooth mouse parallax damping
      targetRotationX = mouseY * 0.4
      targetRotationY = mouseX * 0.6
      mainGroup.rotation.x += (targetRotationX - mainGroup.rotation.x) * 0.04
      mainGroup.rotation.y += (targetRotationY - mainGroup.rotation.y) * 0.04

      renderer.render(scene, camera)
    }

    animate()

    // 10. Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("touchmove", handleTouchMove)
      resizeObserver.disconnect()

      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }

      coreGeo.dispose()
      coreMat.dispose()
      innerGeo.dispose()
      innerMat.dispose()
      particleGeo.dispose()
      particleMat.dispose()
      particleTexture.dispose()
      renderer.dispose()
    }
  }, [])

  if (!isWebGLAvailable) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="w-64 h-64 rounded-full bg-gradient-to-tr from-brand/20 via-indigo-500/10 to-transparent blur-2xl animate-pulse" />
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full select-none pointer-events-auto touch-none ${className}`}
      style={{ minHeight: "360px" }}
      aria-hidden="true"
    />
  )
}
