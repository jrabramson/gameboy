import { MeshReflectorMaterial, useTexture } from '@react-three/drei'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'

const Floor = ({ isOn }) => {
  const tl = useRef(gsap.timeline())
  const reflectorFloorRef = useRef()
  const texturedFloorRef = useRef()

  const floorTexture = useTexture('gameboy_repeat.png')
  floorTexture.wrapS = floorTexture.wrapT = 1000
  floorTexture.repeat.set(50, 50)
  floorTexture.rotation = Math.PI / 2

  const floorNormalTexture = useTexture('gameboy_repeat_normal.png')
  floorNormalTexture.wrapS = floorNormalTexture.wrapT = 1000
  floorNormalTexture.repeat.set(80, 80)
  floorNormalTexture.rotation = Math.PI / 2

  useEffect(() => {
    if (!isOn) return

    tl.current.clear()

    tl.current.to(reflectorFloorRef.current.material, {
      duration: 1.0,
      opacity: 0.7,
      ease: "power3.in"
    }, 'fadefloor')

    tl.current.play('fadefloor')
  }, [isOn])

  return (
    <>
      <mesh castShadow receiveShadow rotation={[-Math.PI / 2, 0, 0]} ref={reflectorFloorRef}>
        <planeGeometry args={[200, 200]} />
        <MeshReflectorMaterial
          color="#878790"
          // blur={[400, 400]}
          mixBlur={1}
          mixStrength={3}
          depthScale={1}
          minDepthThreshold={0.85}
          metalness={0}
          roughness={1}
          mirror={0.1}
          transparent
          opacity={0.9}
        />
      </mesh>

      <mesh castShadow receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]} ref={texturedFloorRef}>
        <planeGeometry args={[200, 200]} />
        <MeshReflectorMaterial
          color="#878790"
          blur={[400, 400]}
          mixBlur={1}
          mixStrength={3}
          depthScale={1}
          minDepthThreshold={0.85}
          metalness={0}
          roughness={1}
          mirror={0.1}
          map={floorTexture}
        />
      </mesh>
    </>
  )
}

export default Floor
