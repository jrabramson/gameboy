import React, { useRef, useEffect, useState, forwardRef, useMemo } from 'react'
import { useGLTF, useAnimations, useKeyboardControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3, Quaternion, Mesh } from 'three'
import gsap from 'gsap'
import { debounce } from "lodash"

import Sound from './Sound'

const carts = [];

const Cart = forwardRef(({ geom, mat, fire, position = new Vector3(), rotation = new Vector3() }, ref) => {
  return <mesh
    ref={ref}
    name="cart"
    castShadow
    receiveShadow
    geometry={geom}
    material={mat}
    position={position}
    rotation={rotation}
    scale={0.001}
  />
})

const createCart = ({ scene, geom, mat, fire, position = new Vector3(), rotation = new Vector3() }) => {
  const mesh = new Mesh(geom, mat)

  mesh.castShadow = true
  mesh.scale.set(0.006, 0.006, 0.006)
  mesh.position.copy(position);
  mesh.quaternion.copy(rotation);

  scene.add(mesh)

  const render = () => {
    mesh.translateZ(-0.2);
    mesh.rotateZ(0.2);

    requestAnimationFrame(render)
  }

  setTimeout(() => {
    scene.remove(mesh)
  }, 5000)

  requestAnimationFrame(render);
}

let velocity = 0.0,
  speed = 0.0,
  ds = 0.001,
  inertia = 0.5,
  acceleration = 0.3,
  targetPos = new Vector3;

const Gameboy = (props) => {
  const tl = useRef(gsap.timeline({ paused: true }))
  const group = useRef()
  const powerButtonRef = useRef()
  const targetRef = useRef()
  const cartRef = useRef()
  const soundControllerRef = useRef()
  const greenLightRef = useRef()
  const spotLightRef = useRef()
  const cartsRef = useRef()

  const { scene } = useThree()

  const { nodes, materials, animations } = useGLTF('/gameboy.glb')
  const { actions } = useAnimations(animations, group)

  const [isRedLightOn, setIsRedLightOn] = useState(false)
  const [legsOut, setLegsOut] = useState(false)
  const [interactionEnabled, setInteractionEnabled] = useState(false)

  const [subscribeKeys] = useKeyboardControls()
  const interactPressed = useKeyboardControls(state => state.interact)

  const { left, right, forward, backward } = useKeyboardControls(state => state)

  const onPowerOn = () => {
    greenLightRef.current.intensity = 0.0
    tl.current.clear()

    tl.current.to(powerButtonRef.current.position, {
      duration: 0.1,
      x: -0.0365,
    }, 'poweron')

    tl.current.play('poweron')

    setTimeout(() => {
      props.setPowerOn()
    }, 100)
  }

  useFrame((state) => {
    state.camera.lookAt(
      new Vector3(targetPos.x, state.camera.position.y, targetPos.z)
    )

    targetRef.current.getWorldPosition(targetPos)
    spotLightRef.current.lookAt(group.current.position)

    if (!interactionEnabled) return;

    speed = 0.0;

    if (!(forward || backward)) {
      if (velocity > 0) {
        speed -= ds * inertia;
      } else if (velocity < 0) {
        speed += ds * inertia;
      }

      if (velocity > -0.0008 && velocity < 0.0008) {
        speed = velocity = 0.0;
      }
    }

    if (forward) {
      speed -= ds * acceleration;
    }

    if (backward) {
      speed += ds * acceleration;
    }

    velocity += speed
    velocity = Math.min(velocity, 0.025)
    velocity = Math.max(velocity, -0.025)

    if (right && !backward && velocity !== 0) {
      group.current.rotation.y -= 0.01;
    } else if (right && backward && velocity !== 0) {
      group.current.rotation.y += 0.01;
    }

    if (left && !backward && velocity !== 0) {
      group.current.rotation.y += 0.01;
    } else if (left && backward && velocity !== 0) {
      group.current.rotation.y -= 0.01;
    }

    const direction = new Vector3(0, 0, 0)
    if (group.current) group.current.getWorldDirection(direction)
    group.current.position.addScaledVector(direction, velocity);

    const v = velocity !== 0.0 ? Math.max(Math.abs(velocity), 0.015) * 50 : 0.0;
    ['walktr2', 'walktl2', 'walkbr2', 'walkbl2', 'walking'].forEach((key) => {
      if (velocity < 0) {
        actions[key].timeScale = v
      }

      if (velocity > 0) {
        actions[key].timeScale = -v
      }
    })
  })

  useEffect(() => {
    ['unfold1', 'unfold2', 'unfold3', 'unfold4'].forEach((key) => {
      actions[key].setLoop(2200)
      actions[key].clampWhenFinished = true
      actions[key].enabled = true
      actions[key].timeScale = -1
      actions[key].reset().play()
    });
    ['opentr', 'opentl', 'shake', 'setuptl', 'setuptr', 'setupbl', 'setupbr', 'rise', 'firetr', 'firetl', 'firebr', 'firebl', 'fire'].forEach((key) => {
      actions[key].setLoop(2200)
      actions[key].clampWhenFinished = true
      actions[key].enabled = true
    });
  }, [actions])

  useEffect(() => {
    if (!interactionEnabled) return;

    const unsubforwardEvent = subscribeKeys(
      (state) => state.forward,
      (value) => {
        if (value) {
          ;['walktr2', 'walktl2', 'walkbr2', 'walkbl2', 'walking'].forEach((key) => {
            actions[key].reset()
            actions[key].play()
            actions[key].fadeIn(1.5)
          })

          actions['idletr'].fadeOut(0.5)
          actions['idletl'].fadeOut(0.5)
          actions['idlebr'].fadeOut(0.5)
          actions['idlebl'].fadeOut(0.5)
          actions['idle'].fadeOut(0.5)
        }

        if (!value) {
          actions['idletr'].reset().play().fadeIn(0.5)
          actions['idletl'].reset().play().fadeIn(0.5)
          actions['idlebr'].reset().play().fadeIn(0.5)
          actions['idlebl'].reset().play().fadeIn(0.5)
          actions['idle'].reset().play().fadeIn(0.5);

          ['walktr2', 'walktl2', 'walkbr2', 'walkbl2', 'walking'].forEach((key) => {
            actions[key].fadeOut(1.5)
          })
        }
      }
    )

    const unsubbackwardEvent = subscribeKeys(
      (state) => state.backward,
      (value) => {
        if (value) {
          ;['walktr2', 'walktl2', 'walkbr2', 'walkbl2', 'walking'].forEach((key) => {
            actions[key].reset()
            actions[key].play()
            actions[key].fadeIn(1.5)
          })

          actions['idletr'].fadeOut(1.6)
          actions['idletl'].fadeOut(1.6)
          actions['idlebr'].fadeOut(1.6)
          actions['idlebl'].fadeOut(1.6)
          actions['idle'].fadeOut(1.6)
        }

        if (!value) {
          actions['idletr'].reset().play().fadeIn(1.6)
          actions['idletl'].reset().play().fadeIn(1.6)
          actions['idlebr'].reset().play().fadeIn(1.6)
          actions['idlebl'].reset().play().fadeIn(1.6)
          actions['idle'].reset().play().fadeIn(1.6);

          ['walktr2', 'walktl2', 'walkbr2', 'walkbl2', 'walking'].forEach((key) => {
            actions[key].fadeOut(1.5)
          })
        }
      }
    )

    return () => {
      unsubforwardEvent()
      unsubbackwardEvent()
    }
  }, [interactionEnabled])

  const fireCart = () => {
    const [position, rotation] = getCartPosition()

    createCart({
      position: position,
      rotation: rotation,
      fire: true,
      geom: nodes.cart.geometry,
      mat: materials.Cartridge,
      scene: scene,
    })

    soundControllerRef.current.play()

    actions['fire'].reset().play()
    actions['firetr'].reset().play()
    actions['firetl'].reset().play()
    actions['firebr'].reset().play()
    actions['firebl'].reset().play()
  }

  const debouncedFireCart = useMemo(
    () => debounce(fireCart, 200, {
      'leading': true,
      'trailing': false
    })
    , []);

  useEffect(() => {
    if (!interactionEnabled) return
    if (!interactPressed) return

    debouncedFireCart()
  }, [interactPressed, cartRef.current])

  useEffect(() => {
    if (!props.started) return

    setTimeout(() => {
      tl.current.to(greenLightRef.current, {
        duration: 3.5,
        intensity: 0.3,
      }, 'greenlight')

      tl.current.play('greenlight')
    }, 5500);
  }, [props.started])

  useEffect(() => {
    if (!props.isOn) return

    setTimeout(() => {
      setIsRedLightOn(true)

      setTimeout(() => {
        actions['opentr'].reset().play()
        actions['opentl'].reset().play()
      }, 6000)

      setTimeout(() => {
        ;['unfold1', 'unfold2', 'unfold3', 'unfold4'].map((key) => {
          actions[key].timeScale = 1
          actions[key].reset().play()

          setTimeout(() => {
            actions['rise'].reset().play()
              ;['setuptl', 'setuptr', 'setupbl', 'setupbr'].forEach((key) => {
                actions[key].reset().play()
              })

            setLegsOut(true)

            setTimeout(() => {
              ['idletr', 'idletl', 'idlebr', 'idlebl', 'idle'].forEach((key) => {
                actions[key].reset().play()
              })

              setTimeout(() => {
                setInteractionEnabled(true)

                setTimeout(() => {
                  document.querySelector('.controls').classList.add('active')
                }, 3000)
              }, 1000)
            }, 2000)
          }, 2400)
        })
      }, 7500)
    }, 10)
  }, [props.isOn])

  useEffect(() => {
    if (legsOut) {
      tl.current.clear()

      tl.current.to(targetRef.current.position, {
        delay: 3.8,
        duration: 1.5,
        y: 0.0,
        z: -0.08,
        x: 0
      }, 'movetarget')

      tl.current.play('movetarget')
    }
  }, [legsOut])

  const getCartPosition = () => {
    if (!cartRef.current) return [-0.007, -0.01, -0.036]

    const worldPos = new Vector3()
    const worldRot = new Quaternion()
    cartRef.current.updateMatrixWorld(true)
    cartRef.current.getWorldPosition(worldPos)
    cartRef.current.getWorldQuaternion(worldRot)

    return [worldPos, worldRot]
  }

  return (
    <>
      <group ref={group} {...props} dispose={null}>
        <Sound url="sounds/shoot.wav" delay={3.5} ref={soundControllerRef} />
        <group name="Scene">
          {props.children}
          <group name="gameboy" position={[0.005, 0.029, 0.001]}>
            <pointLight castShadow position={[0, 0.15, 0]} intensity={0.2} ref={spotLightRef} shadow-bias={0.015} distance={2.5} />
            <pointLight position={[0, 0.15, 0]} intensity={0.2} ref={spotLightRef} shadow-bias={0.015} distance={2.5} />
            {isRedLightOn && <pointLight position={[-0.039, 0.013, -0.033]} color='red' intensity={0.5} distance={0.01} />}
            <pointLight ref={greenLightRef} position={[-0.041, -0.005, -0.071]} color='green' intensity={0.0} distance={0.006} />

            <Cart
              ref={cartRef}
              geom={nodes.cart.geometry}
              mat={materials.Cartridge}
              fire={false}
              position={[-0.007, -0.01, -0.036]}
              rotation={[0.03, 0, -3.141]}
            />
            <mesh ref={targetRef} position={[0, 0, 0]} />

            <mesh
              name="a_low"
              castShadow
              receiveShadow
              geometry={nodes.a_low.geometry}
              material={materials.External}
              position={[0.014, 0.008, 0.035]}
            />
            <mesh
              name="b_low"
              castShadow
              receiveShadow
              geometry={nodes.b_low.geometry}
              material={materials.External}
              position={[0.028, 0.008, 0.027]}
            />
            <mesh
              name="backvent_low"
              castShadow
              receiveShadow
              geometry={nodes.backvent_low.geometry}
              material={materials.External}
              position={[-0.009, -0.021, 0.004]}
            />
            <mesh
              name="base_low"
              castShadow
              receiveShadow
              geometry={nodes.base_low.geometry}
              material={materials.Main}
              position={[-0.006, -0.02, 0.006]}
            />
            <mesh
              name="battery_low"
              castShadow
              receiveShadow
              geometry={nodes.battery_low.geometry}
              material={materials.External}
              position={[-0.039, 0.011, -0.033]}
            />
            <mesh
              name="channel_low"
              castShadow
              receiveShadow
              geometry={nodes.channel_low.geometry}
              material={materials.External}
              position={[-0.044, -0.001, -0.027]}
            />
            <mesh
              name="Cylinder010"
              castShadow
              receiveShadow
              geometry={nodes.Cylinder010.geometry}
              material={materials.External}
              position={[-0.007, 0.001, 0.077]}
            />
            <mesh
              name="dviBox_low"
              castShadow
              receiveShadow
              geometry={nodes.dviBox_low.geometry}
              material={materials.External}
              position={[0.034, -0.003, -0.033]}
            />
            <mesh
              name="dviMetal_low"
              castShadow
              receiveShadow
              geometry={nodes.dviMetal_low.geometry}
              material={materials.External}
              position={[0.038, -0.007, -0.035]}
            />
            <mesh
              name="dviPart_low"
              castShadow
              receiveShadow
              geometry={nodes.dviPart_low.geometry}
              material={materials.External}
              position={[0.031, -0.006, -0.035]}
            />
            <mesh
              name="dviSmall_low"
              castShadow
              receiveShadow
              geometry={nodes.dviSmall_low.geometry}
              material={materials.External}
              position={[0.031, -0.007, -0.038]}
            />
            <mesh
              name="hatch"
              castShadow
              receiveShadow
              geometry={nodes.hatch.geometry}
              material={materials.Main}
              position={[-0.049, 0.012, -0.035]}
            />
            <mesh
              name="hatch001"
              castShadow
              receiveShadow
              geometry={nodes.hatch001.geometry}
              material={materials.Main}
              position={[-0.049, 0.012, 0.046]}
            />
            <mesh
              name="hatch002"
              castShadow
              receiveShadow
              geometry={nodes.hatch002.geometry}
              material={materials.Main}
              position={[0.039, 0.011, 0.046]}
            />
            <mesh
              name="hatch003"
              castShadow
              receiveShadow
              geometry={nodes.hatch003.geometry}
              material={materials.Main}
              position={[0.038, 0.012, -0.035]}
            />
            <mesh
              name="lock_low"
              castShadow
              receiveShadow
              geometry={nodes.lock_low.geometry}
              material={materials.External}
              position={[-0.006, -0.02, 0.006]}
            />
            <mesh
              name="lockOpen_low"
              castShadow
              receiveShadow
              geometry={nodes.lockOpen_low.geometry}
              material={materials.External}
              position={[-0.007, -0.023, 0.015]}
            />
            <mesh
              name="movement_low"
              castShadow
              receiveShadow
              geometry={nodes.movement_low.geometry}
              material={materials.External}
              position={[-0.032, 0.016, 0.033]}
            />
            <mesh
              name="movementknobs_low"
              castShadow
              receiveShadow
              geometry={nodes.movementknobs_low.geometry}
              material={materials.External}
              position={[-0.036, 0.015, 0.032]}
            />
            <mesh
              name="Plane009"
              castShadow
              receiveShadow
              geometry={nodes.Plane009.geometry}
              material={materials["Black Screen"]}
              position={[0.018, 0.008, 0.062]}
            />
            <mesh
              name="screen_low"
              castShadow
              receiveShadow
              geometry={nodes.screen_low.geometry}
              material={materials.External}
              position={[-0.006, 0.011, -0.027]}
            />
            <mesh
              name="screenHolder_low"
              castShadow
              receiveShadow
              geometry={nodes.screenHolder_low.geometry}
              material={materials.External}
              position={[-0.006, 0.013, -0.027]}
            />
            <mesh
              name="select_low"
              castShadow
              receiveShadow
              geometry={nodes.select_low.geometry}
              material={materials.External}
              position={[-0.006, -0.02, 0.006]}
            />
            <mesh
              name="switch_low"
              castShadow
              receiveShadow
              geometry={nodes.switch_low.geometry}
              material={materials.External}
              position={[-0.041, -0.005, -0.068]}
              ref={powerButtonRef}
              onClick={onPowerOn}
            />
            <mesh
              name="vol_low"
              castShadow
              receiveShadow
              geometry={nodes.vol_low.geometry}
              material={materials.External}
              position={[0.034, -0.005, -0.016]}
            />
            <mesh
              name="volumeBox_low"
              castShadow
              receiveShadow
              geometry={nodes.volumeBox_low.geometry}
              material={materials.External}
              position={[0.035, -0.003, -0.016]}
            />
          </group>
          <group visible={legsOut}>
            <group name="IK_arma_tl" position={[-0.039, 0.031, -0.023]}>
              <primitive object={nodes.Bone01} />
            </group>
            <group name="IK_arma_bl" position={[-0.039, 0.031, 0.05]}>
              <primitive object={nodes.Bone01_1} />
            </group>
            <group name="IK_arma_tr" position={[0.04, 0.031, -0.023]}>
              <primitive object={nodes.Bone01_2} />
            </group>
            <group name="IK_arma_br" position={[0.04, 0.031, 0.049]}>
              <primitive object={nodes.Bone01_3} />
            </group>
            <skinnedMesh
              castShadow receiveShadow
              name="IK_leg_tl"
              geometry={nodes.IK_leg_tl.geometry}
              material={nodes.IK_leg_tl.material}
              skeleton={nodes.IK_leg_tl.skeleton}
            />
            <skinnedMesh
              castShadow receiveShadow
              name="IK_leg_bl"
              geometry={nodes.IK_leg_bl.geometry}
              material={nodes.IK_leg_bl.material}
              skeleton={nodes.IK_leg_bl.skeleton}
            />
            <skinnedMesh
              castShadow receiveShadow
              name="IK_leg_tr"
              geometry={nodes.IK_leg_tr.geometry}
              material={nodes.IK_leg_tr.material}
              skeleton={nodes.IK_leg_tr.skeleton}
            />
            <skinnedMesh
              castShadow receiveShadow
              name="IK_leg_br"
              geometry={nodes.IK_leg_br.geometry}
              material={nodes.IK_leg_br.material}
              skeleton={nodes.IK_leg_br.skeleton}
            />
          </group>
          <group visible={!legsOut}>
            <skinnedMesh
              castShadow receiveShadow
              name="unfoldleg"
              geometry={nodes.unfoldleg.geometry}
              material={nodes.unfoldleg.material}
              skeleton={nodes.unfoldleg.skeleton}
            />
            <group name="unfoldarmature" position={[-0.039, 0.031, -0.023]}>
              <primitive object={nodes.Bone01_4} />
            </group>
            <skinnedMesh
              castShadow receiveShadow
              name="unfoldleg001"
              geometry={nodes.unfoldleg001.geometry}
              material={nodes.unfoldleg001.material}
              skeleton={nodes.unfoldleg001.skeleton}
            />
            <group name="unfoldarmature001" position={[-0.039, 0.031, 0.05]}>
              <primitive object={nodes.Bone01_5} />
            </group>
            <skinnedMesh
              castShadow receiveShadow
              name="unfoldleg002"
              geometry={nodes.unfoldleg002.geometry}
              material={nodes.unfoldleg002.material}
              skeleton={nodes.unfoldleg002.skeleton}
            />
            <group name="unfoldarmature002" position={[0.04, 0.031, -0.023]}>
              <primitive object={nodes.Bone01_6} />
            </group>
            <skinnedMesh
              castShadow receiveShadow
              name="unfoldleg003"
              geometry={nodes.unfoldleg003.geometry}
              material={nodes.unfoldleg003.material}
              skeleton={nodes.unfoldleg003.skeleton}
            />
            <group name="unfoldarmature003" position={[0.04, 0.031, 0.049]}>
              <primitive object={nodes.Bone01_7} />
            </group>
          </group>
        </group>
      </group>
    </>
  )
}

useGLTF.preload('/gameboy.glb')

export default Gameboy
