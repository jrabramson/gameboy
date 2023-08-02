const Target = (props) => {
    return <mesh {...props}>
        <boxBufferGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="hotpink" />
    </mesh>
}

export default Target