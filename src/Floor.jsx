import { MeshReflectorMaterial, useTexture, useKeyboardControls } from '@react-three/drei'
import { DoubleSide } from 'three'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
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

  const { forward, left, right } = useKeyboardControls(state => state)

  useFrame(() => {
    // if (forward) {
    //   // change the floor texture offset to animate the floor taking into account the rotation of the character
    //   floorTexture.offset.x += 0.007;
    //   // floorTexture.offset.y += 0.015;
    // }

    // if (left) {
    //   texturedFloorRef.current.rotation.z -= 0.01
    // }

    // if (right) {
    //   texturedFloorRef.current.rotation.z += 0.01
    // }
  })

  useEffect(() => {
    if (!isOn) return

    tl.current.clear()

    tl.current.to(reflectorFloorRef.current.material, {
      duration: 1.0,
      opacity: 0.8,
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
          blur={[400, 400]}
          // resolution={1024}
          mixBlur={1}
          mixStrength={3}
          depthScale={1}
          minDepthThreshold={0.85}
          metalness={0}
          roughness={1}
          mirror={0.1}
          transparent
          opacity={1.0}
        />
      </mesh>

      <mesh castShadow receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]} ref={texturedFloorRef}>
        <planeGeometry args={[200, 200]} />
        <MeshReflectorMaterial
          color="#878790"
          blur={[400, 400]}
          // resolution={1024}
          mixBlur={1}
          mixStrength={3}
          depthScale={1}
          minDepthThreshold={0.85}
          metalness={0}
          roughness={1}
          mirror={0.1}
          map={floorTexture}
        // normalMap={floorNormalTexture}
        />
      </mesh>
      {/* <mesh castShadow receiveShadow position={[0, -0.001, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[200, 200]} />
        <meshBasicMaterial color="black" />
      </mesh> */}
    </>
  )
}

export default Floor
