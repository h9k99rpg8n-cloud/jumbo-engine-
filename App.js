import React, { useRef } from 'react';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';
import { GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import * as THREE from 'three';

export default function App() {
  const animationRef = useRef(null);

  const iniciarMotorJumbo = async (gl) => {
    const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#05070D');

    const camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 1000);
    camera.position.set(0, 1.2, 4);

    const renderer = new Renderer({ gl });
    renderer.setSize(width, height);
    renderer.setClearColor('#05070D');

    const luzAmbiente = new THREE.AmbientLight(0xffffff, 0.55);
    scene.add(luzAmbiente);

    const luzPrincipal = new THREE.DirectionalLight(0xffffff, 1.35);
    luzPrincipal.position.set(3, 5, 4);
    scene.add(luzPrincipal);

    const geometria = new THREE.BoxGeometry(1.4, 1.4, 1.4);
    const material = new THREE.MeshStandardMaterial({
      color: 0x44aaff,
      metalness: 0.35,
      roughness: 0.28,
    });

    const cuboJumbo = new THREE.Mesh(geometria, material);
    cuboJumbo.name = 'Cubo Jumbo Engine';
    scene.add(cuboJumbo);

    const rejilla = new THREE.GridHelper(6, 12, 0x335577, 0x172033);
    rejilla.position.y = -1.05;
    scene.add(rejilla);

    const loop = () => {
      animationRef.current = requestAnimationFrame(loop);

      cuboJumbo.rotation.x += 0.01;
      cuboJumbo.rotation.y += 0.014;

      renderer.render(scene, camera);
      gl.endFrameEXP();
    };

    loop();
  };

  return (
    <SafeAreaView style={styles.app}>
      <View style={styles.header}>
        <Text style={styles.title}>Jumbo Engine</Text>
        <Text style={styles.subtitle}>Alpha 0.1 · Expo + Three.js · iOS Ready</Text>
      </View>

      <GLView style={styles.viewport} onContextCreate={iniciarMotorJumbo} />

      <View style={styles.footer}>
        <Text style={styles.footerText}>Escena base 3D funcionando. Siguiente paso: editor, cámara táctil y herramientas.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: '#05070D',
  },
  header: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#18243A',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  subtitle: {
    color: '#8FB8FF',
    fontSize: 13,
    marginTop: 4,
  },
  viewport: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#18243A',
    backgroundColor: '#080B14',
  },
  footerText: {
    color: '#CBD8FF',
    fontSize: 12,
    textAlign: 'center',
  },
});
