import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useGLTF, useFBX, useAnimations } from '@react-three/drei';
import { useControls } from 'leva';
import { useLoader, useFrame } from '@react-three/fiber';

import * as THREE from 'three'

const occulusToRhubarbConversion = {
  A: "viseme_PP",
  B: "viseme_kk",
  C: "viseme_I",
  D: "viseme_AA",
  E: "viseme_O",
  F: "viseme_U",
  G: "viseme_FF",
  H: "viseme_TH",
  X: "viseme_PP",
}

export function Avatar(props) {

  const {playAudio, script} = useControls(
    {
      playAudio: false,
      script: {
        value: "welcome", 
        options: ["welcome", "kotek", "python"]
      },
    }
  )

  
  
  const { nodes, materials } = useGLTF('models/avatar.glb');
  
  
  const { animations: idleAnimation } = useFBX('/animations/Idle.fbx');
  const { animations: angryAnimation } = useFBX('/animations/Angry.fbx');
  const { animations: greetingAnimation } = useFBX('/animations/Standing Greeting.fbx');
  
  idleAnimation[0].name = 'Idle';
  angryAnimation[0].name = 'Angry';
  greetingAnimation[0].name = 'Greeting';
  
  const [animation, setAnimation] = useState('Idle')
  
  const group = useRef();
  const { actions } = useAnimations(
    [idleAnimation[0], angryAnimation[0], greetingAnimation[0]], group
    );
    
  const audio = useMemo(() => new Audio(`/audio/${script}.mp3`), [script]);

  const jsonFile = useLoader(THREE.FileLoader, `/audio/${script}.json`)
  const lipSync = JSON.parse(jsonFile);
  
    
    useEffect(() => {
      if (playAudio) {
        audio.play();
        if (script === "welcome") {
          setAnimation("Greeting")
        } else if (script === "kotek") {
          setAnimation("Idle")
        } else if (script === "python") {
          setAnimation("Angry")
        } else {
          setAnimation("Idle")
        }
  
      } else {
        audio.pause();
      }
      return (
        () => {
          audio.pause();
        }
        )
        
      }, [playAudio, script])


    useEffect(() => {
      actions[animation].reset().fadeIn(0.5).play();
      
      return () => {
        actions[animation].fadeOut(0.5)
      }
      
    }, [animation, props.viewport, playAudio])

      
    useFrame(() => {
      const currentAudioTime = audio.currentTime;
      if (audio.paused || audio.ended) {
        setAnimation("Idle")
      }

      console.log(animation)
  
      Object.values(occulusToRhubarbConversion).forEach((value) => {
        nodes.Wolf3D_Head.morphTargetInfluences[nodes.Wolf3D_Head.morphTargetDictionary[value]] = 0

        nodes.Wolf3D_Teeth.morphTargetInfluences[nodes.Wolf3D_Teeth.morphTargetDictionary[value]] = 0
      });
    
    
      for (let i = 0; i < lipSync.mouthCues.length; i++) {
        const mouthCue = lipSync.mouthCues[i];
        if (currentAudioTime >= mouthCue.start && currentAudioTime <= mouthCue.end) {
          nodes.Wolf3D_Head.morphTargetInfluences[nodes.Wolf3D_Head.morphTargetDictionary[occulusToRhubarbConversion[mouthCue.value]]] = 1

          nodes.Wolf3D_Teeth.morphTargetInfluences[nodes.Wolf3D_Teeth.morphTargetDictionary[occulusToRhubarbConversion[mouthCue.value]]] = 1
          break
        }
      }
    })
      
      
      
      return (
        <group ref={group} {...props} dispose={null}>
      <primitive object={nodes.Hips} />
      <skinnedMesh
        name="EyeLeft"
        geometry={nodes.EyeLeft.geometry}
        material={materials.Wolf3D_Eye}
        skeleton={nodes.EyeLeft.skeleton}
        morphTargetDictionary={nodes.EyeLeft.morphTargetDictionary}
        morphTargetInfluences={nodes.EyeLeft.morphTargetInfluences}
        />
      <skinnedMesh
        name="EyeRight"
        geometry={nodes.EyeRight.geometry}
        material={materials.Wolf3D_Eye}
        skeleton={nodes.EyeRight.skeleton}
        morphTargetDictionary={nodes.EyeRight.morphTargetDictionary}
        morphTargetInfluences={nodes.EyeRight.morphTargetInfluences}
      />
      <skinnedMesh
        name="Wolf3D_Head"
        geometry={nodes.Wolf3D_Head.geometry}
        material={materials.Wolf3D_Skin}
        skeleton={nodes.Wolf3D_Head.skeleton}
        morphTargetDictionary={nodes.Wolf3D_Head.morphTargetDictionary}
        morphTargetInfluences={nodes.Wolf3D_Head.morphTargetInfluences}
      />
      <skinnedMesh
        name="Wolf3D_Teeth"
        geometry={nodes.Wolf3D_Teeth.geometry}
        material={materials.Wolf3D_Teeth}
        skeleton={nodes.Wolf3D_Teeth.skeleton}
        morphTargetDictionary={nodes.Wolf3D_Teeth.morphTargetDictionary}
        morphTargetInfluences={nodes.Wolf3D_Teeth.morphTargetInfluences}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Hair.geometry}
        material={materials.Wolf3D_Hair}
        skeleton={nodes.Wolf3D_Hair.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Body.geometry}
        material={materials.Wolf3D_Body}
        skeleton={nodes.Wolf3D_Body.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Outfit_Bottom.geometry}
        material={materials.Wolf3D_Outfit_Bottom}
        skeleton={nodes.Wolf3D_Outfit_Bottom.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Outfit_Footwear.geometry}
        material={materials.Wolf3D_Outfit_Footwear}
        skeleton={nodes.Wolf3D_Outfit_Footwear.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Outfit_Top.geometry}
        material={materials.Wolf3D_Outfit_Top}
        skeleton={nodes.Wolf3D_Outfit_Top.skeleton}
      />
    </group>
  );
}

useGLTF.preload("models/avatar.glb");