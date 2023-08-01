import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'

const Cartridge = ({ }) => {
    const ref = useRef()
    const { nodes, materials } = useGLTF('/gameboy.glb')

    return <mesh
        ref={ref}
        name="cart"
        castShadow
        receiveShadow
        geom={nodes.cart.geometry}
        mat={materials.Cartridge}
        position={[-0.007, -0.01, -0.036]}
        rotation={[0.03, 0, -3.141]}
        scale={0.001}
    />
}

export default Cartridge