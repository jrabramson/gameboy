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
import Sound from './Sound'

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
  const cameraRef = useRef(null)
  const soundControllerRef = useRef(null)

  const [isStarted, setIsStarted] = React.useState(true)
  const [isOn, setIsOn] = React.useState(false)

  const setPowerOn = () => {
    setIsOn(true)
  }

  return (
    <Suspense fallback={<Loader />}>
      <Canvas
        gl={{
          antialias: true,
          toneMapping: ACESFilmicToneMapping,
          outputColorSpace: SRGBColorSpace,
          physicallyCorrectLights: true
        }}
        shadows="soft">
        <CameraAnimation camera={cameraRef} isStarted={isStarted} isOn={isOn} />
        <Sound url="sounds/startup.mp3" delay={3.7} play={isOn} ref={soundControllerRef} />
        <OrbitControls />

        <color args={['#080406']} attach="background" />
        <fog attach="fog" args={['#171720', 60, 90]} />

        <ambientLight intensity={0.2} />
        {/* <pointLight position={[20, 5, 20]} intensity={1.0} /> */}

        <Gameboy scale={5.0} position={[0, 0, 0]} isOn={isOn} setPowerOn={setPowerOn}>
          <Sound url="sounds/cybergrind.wav" delay={4.8} play={isOn} loop={true} volume={0.5} />

          <PerspectiveCamera near={0.1} position={[1.1, 0.2, 0.7]} makeDefault ref={cameraRef}>
            {!isStarted && <Text fontSize={0.1} position={[0, 0.1, -3.0]} color="white" anchorX="center" anchorY="middle" onClick={() => setIsStarted(true)} onPointerEnter={() => { document.body.style.cursor = 'pointer' }} onPointerLeave={() => { document.body.style.cursor = 'default' }}>
              new game(boy)
              <meshBasicMaterial color="white" depthTest={false} />
            </Text>}
          </PerspectiveCamera>
        </Gameboy>
        {/* <ContactShadows position={[0, 0.1, 0]} opacity={1.0} scale={10} blur={1.5} far={0.8} /> */}

        <Floor isOn={isOn} />

        <Preload all />
      </Canvas>
    </Suspense>
  )
}

export default Scene
