import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react'
import { useThree, useLoader } from '@react-three/fiber'
import { AudioListener, AudioLoader } from 'three'

const Sound = forwardRef(({ url, loop = false, delay = 0, trigger, play, volume = 1.0 }, ref) => {
    const sound = useRef()
    const { camera } = useThree()
    const [listener] = useState(() => new AudioListener())
    const buffer = useLoader(AudioLoader, url)

    useEffect(() => {
        sound.current.setBuffer(buffer)
        sound.current.setRefDistance(1)
        sound.current.setLoop(loop)
        sound.current.setVolume(volume)
        camera.add(listener)

        if (!play) return () => camera.remove(listener)

        setTimeout(() => {
            sound.current.play()
        }, delay * 1000)

        return () => camera.remove(listener)
    }, [delay, loop, play, volume])

    useEffect(() => {
        if (trigger) {
            sound.current.play()
        }
    }, [trigger])

    useImperativeHandle(ref, () => ({
        play: () => {
            sound.current.play()
        },
        stop: () => {
            sound.current.stop()
        }
    }))

    return <group ref={ref}><positionalAudio ref={sound} args={[listener]} /></group>
})

export default Sound