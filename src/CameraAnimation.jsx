import { useEffect, useRef } from 'react'
import gsap from 'gsap'

const CameraAnimation = ({ camera, isStarted, isOn }) => {
  const tl = useRef(gsap.timeline())

  useEffect(() => {
    if (!isStarted) return
    if (!camera.current) return
    tl.current.clear()

    tl.current.to(camera.current.position, {
      duration: 4.0,
      x: 0.1,
      y: 0.1,
      z: -0.2,
      ease: "power3.in"
    }, 'start')
    tl.current.to(camera.current.position, {
      delay: 4.0,
      duration: 1.0,
      x: -0.1,
      y: 0.1,
      z: -0.2,
      ease: "power3.out"
    }, 'start')

    tl.current.play('start')
  }, [camera, isStarted])

  useEffect(() => {
    if (!isOn) return
    if (!camera.current) return
    tl.current.clear()

    tl.current.to(camera.current.position, {
      duration: 3.0,
      x: 0.023,
      y: 0.26,
      z: 0.03,
      ease: "power3.inOut"
    }, 'on')

    tl.current.to(camera.current.position, {
      delay: 6.0,
      duration: 3.0,
      x: 0.001,
      y: 0.3,
      z: 0.2,
      ease: "power3.inOut"
    }, 'on')

    tl.current.to(camera.current.position, {
      delay: 10.0,
      duration: 4.0,
      x: 0.0,
      y: 0.18,
      z: 0.32,
      ease: "power3.inOut"
    }, 'on')

    tl.current.play('on')
  }, [camera, isOn])

  return null
}

export default CameraAnimation
