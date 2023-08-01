import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import Scene from './Scene'
import { KeyboardControls } from '@react-three/drei'

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
    <StrictMode>
        <KeyboardControls
            map={[
                { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
                { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
                { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
                { name: 'right', keys: ['ArrowRight', 'KeyD'] },
                { name: 'interact', keys: ['Space'] },
            ]}
        >
            <Scene />
        </KeyboardControls>
    </StrictMode>)