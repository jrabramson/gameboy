import React, { Suspense, useEffect, useRef } from 'react'
import { ACESFilmicToneMapping, SRGBColorSpace } from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Preload, Text, useProgress, ContactShadows } from '@react-three/drei'
import { useControls } from 'leva'

import Gameboy from './Gameboy'
import Cartridge from './Cartridge'
import CameraAnimation from './CameraAnimation'
import Floor from './Floor'

import './styles.css'

const Loader = () => {
  const { loaded, total } = useProgress();

  const percentageLoaded = (loaded / total) * 100
  return <div className='loader'>
    <div className="lds-ring"><div></div><div></div><div></div><div></div></div>
    <br />
    {percentageLoaded.toFixed(0)}%
  </div>
}

function Scene() {
  const spotLightRef = useRef(null)
  const cameraRef = useRef(null)

  const [isStarted, setIsStarted] = React.useState(true)
  const [isOn, setIsOn] = React.useState(false)

  // const { position } = useControls({
  //   position: { value: [1.1, 0.2, 0.7], min: -10, max: 10, step: 0.1 },
  // })

  const setPowerOn = () => {
    setIsOn(true)
  }

  useEffect(() => {
    if (!spotLightRef.current) return
    spotLightRef.current.lookAt([0, 0, 0])
  }, [spotLightRef.current])

  return (
    <Suspense fallback={<Loader />}>
      <Canvas
        gl={{
          antialias: true,
          toneMapping: ACESFilmicToneMapping,
          outputColorSpace: SRGBColorSpace,
          physicallyCorrectLights: true
        }}
        shadows>
        <CameraAnimation camera={cameraRef} isStarted={isStarted} isOn={isOn} />
        {/* <OrbitControls /> */}

        <color args={['#080406']} attach="background" />
        {/* <fog attach="fog" args={['#171720', 60, 90]} /> */}

        <ambientLight intensity={0.3} />
        <pointLight position={[20, 5, 20]} intensity={1.0} />
        <directionalLight position={[0, 5, 0]} intensity={2.0} radius={0.01} ref={spotLightRef} />

        <Gameboy scale={5.0} position={[0, 0.1, 0]} isOn={isOn} setPowerOn={setPowerOn}>
          <PerspectiveCamera near={0.1} position={[1.1, 0.2, 0.7]} makeDefault ref={cameraRef}>
            {!isStarted && <Text fontSize={0.1} position={[0, 0.1, -3.0]} color="white" anchorX="center" anchorY="middle" onClick={() => setIsStarted(true)} onPointerEnter={() => { document.body.style.cursor = 'pointer' }} onPointerLeave={() => { document.body.style.cursor = 'default' }}>
              new game(boy)
              <meshBasicMaterial color="white" depthTest={false} />
            </Text>}
          </PerspectiveCamera>
        </Gameboy>
        <ContactShadows position={[0, 0.02, 0]} opacity={0.25} scale={10} blur={1.5} far={0.8} />

        <Floor isOn={isOn} />

        <Preload all />
      </Canvas>
    </Suspense>
  )
}

export default Scene
