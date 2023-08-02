import React, { Suspense, useEffect, useRef } from 'react'
import { ACESFilmicToneMapping, SRGBColorSpace } from 'three'
import { Canvas } from '@react-three/fiber'
import { PerspectiveCamera, Preload, Text, useProgress, Hud, OrbitControls } from '@react-three/drei'
import { Physics } from '@react-three/cannon'

import Gameboy from './Gameboy'
import CameraAnimation from './CameraAnimation'
import Floor from './Floor'

import './styles.css'
import Sound from './Sound'
import Target from './Target'

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
  const loop1Ref = useRef(null)
  const loop2Ref = useRef(null)

  const [isStarted, setIsStarted] = React.useState(false)
  const [isOn, setIsOn] = React.useState(false)

  const setPowerOn = () => {
    setIsOn(true)
  }

  // useEffect(() => {
  //   if (!isOn) return

  //   setTimeout(() => {
  //     loop1Ref.current.stop()

  //     setTimeout(() => {
  //       loop2Ref.current.play()
  //     }, 3900)
  //   }, 500)
  // }, [isOn])

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
        <Sound url="sounds/startup.mp3" delay={4.0} play={isOn} ref={soundControllerRef} />
        {/* <OrbitControls /> */}

        <color args={['#080406']} attach="background" />
        <fog attach="fog" args={['#171720', 60, 90]} />

        <ambientLight intensity={0.2} />
        {/* <pointLight position={[20, 5, 20]} intensity={1.0} /> */}

        <Hud>
          {!isStarted && <Text fontSize={0.4} position={[0, -1.8, 0]} color="white" anchorX="center" anchorY="middle" onClick={() => setIsStarted(true)} onPointerEnter={() => { document.body.style.cursor = 'pointer' }} onPointerLeave={() => { document.body.style.cursor = 'default' }}>
            start
            <meshBasicMaterial color="white" depthTest={false} />
          </Text>}
        </Hud>

        <Physics gravity={[0, 0, 0]}>
          <Gameboy scale={5.0} position={[0, -0.01, 0]} isOn={isOn} setPowerOn={setPowerOn} started={isStarted}>
            {/* <Sound ref={loop1Ref} url="sounds/area145.wav" play={isStarted} loop={true} /> */}
            {/* <Sound ref={loop2Ref} url="sounds/area145-2clean.mp3" loop={true} /> */}

            <PerspectiveCamera near={0.1} position={[1.1, 0.2, 0.7]} makeDefault ref={cameraRef}>

            </PerspectiveCamera>
          </Gameboy>
        </Physics>
        {/* <ContactShadows position={[0, 0.1, 0]} opacity={1.0} scale={10} blur={1.5} far={0.8} /> */}

        <Floor isOn={isOn} />

        {/* <Target position={[2, 0, -2]} /> */}

        <Preload all />
      </Canvas>
    </Suspense>
  )
}

export default Scene
