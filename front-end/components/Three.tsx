import { useEffect, useRef,useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { useWallet,useConnection,useAnchorWallet } from '@solana/wallet-adapter-react';
import * as anchor from "@project-serum/anchor";
import {web3} from "@project-serum/anchor"

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader";

import idl from './idl/solsticio_space.json'; // Path to your IDL file
import hydroIdenticon from './snowflakes.js';

const programID = new web3.PublicKey('12NEHqQRyQ1nGcm12jbiFkbGLKFtWiZwAY6fhQ6dAiH7');
const baseAccount = web3.Keypair.generate();
import styles from '../styles/Three.module.css'; // Assuming you have some basic styles
import { PublicKey } from '@solana/web3.js';
export default function ThreePage() {
  const mountRef = useRef(null);
  const walletRef = useRef(null);
  const sceneRef = useRef(null);

  const [walletIconSVG, setWalletIconSVG] = useState<string | null>(null);

  const wallet = useWallet();
  const { connection } = useConnection(); // From @solana/wallet-adapter-react
  const { publicKey, signTransaction } = useWallet(); // Also from @solana/wallet-adapter-react


  


  

  const requestClaim = async (uri: string, coords: [number, number]) => {

    console.log(walletRef)
    if (!walletRef.current?.connected || !walletRef.current?.publicKey) {
      console.log("Wallet not connected");
      alert("Wallet not connected")
      return;
    }
    let provider: anchor.Provider

    try {
      provider = anchor.getProvider()
    } catch {
      provider = new anchor.AnchorProvider(connection, walletRef.current, {})
      anchor.setProvider(provider)
    }
    const program = new anchor.Program(idl as anchor.Idl, '12NEHqQRyQ1nGcm12jbiFkbGLKFtWiZwAY6fhQ6dAiH7')


    const baseAccount = new PublicKey('2PG47EriWNQE1tM3wbf8XcFiSy1QvVCnCkr82mXiGWpc');

    console.log("#####",baseAccount)
    // console.log(program)

    const coordsUint8 = new Uint8Array(new Uint16Array(coords).buffer);
    try {
      // Assuming `requestClaim` is the name of your method in the Anchor program
      // and `program` is your initialized Anchor program object
      const tx = await program.methods.requestClaim(uri, coordsUint8)
        .accounts({
          baseAccount: baseAccount,
          user: walletRef.current?.publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc();
        fetchClaims();
      console.log("Transaction signature", tx);
    } catch (error) {
      console.error("Error making request_claim call", error);
    }
  };

  async function fetchClaims() {
    let provider: anchor.Provider

    try {
      provider = anchor.getProvider()
    } catch {
      provider = new anchor.AnchorProvider(connection, walletRef.current, {})
      anchor.setProvider(provider)
    }
    const program = new anchor.Program(idl as anchor.Idl, '12NEHqQRyQ1nGcm12jbiFkbGLKFtWiZwAY6fhQ6dAiH7')


    const baseAccountPubkey = new PublicKey('2PG47EriWNQE1tM3wbf8XcFiSy1QvVCnCkr82mXiGWpc');

    console.log("#####",baseAccount)
    // Fetch the base account
    const baseAccount = await program.account.baseAccount.fetch(baseAccountPubkey);
    
    // Log the total claims
    console.log("Total Claims:", baseAccount.totalClaims.toString());
    // Iterate through each claim and log its details
    baseAccount.claims.forEach((claim, index) => {
        console.log(`Claim #${index + 1}:`);
        console.log("URI:", claim.uri);
        console.log("Coordinates:", claim.coords);
        console.log("Result:", claim.result ? "Success" : "Failed");
        console.log("---");
        // Generate the icon as a canvas element
        const icon = hydroIdenticon.create({
          seed: claim.uri.toString(), // Replace 'randstring' with your desired seed
          size: 64, // Size of the icon
        });
        console.log(icon);
        // Convert SVG string to Data URL
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(icon);
        const svgBase64 = btoa(svgString);
        console.log(svgBase64)
        const base64DataUrl = `data:image/svg+xml;base64,${svgBase64}`;

        // Create an image and load the SVG
        const image = new Image();
        image.onload = () => {
          // Once the image is loaded, create the texture
          const texture = new THREE.Texture(image);
          texture.needsUpdate = true;
          texture.minFilter = THREE.LinearFilter; // Use LinearFilter to avoid needing mipmaps

          // Use the texture in a material
          const material = new THREE.MeshBasicMaterial({ map: texture });

          // Create your mesh with the material
          const geometry = new THREE.BoxGeometry();
          const cube = new THREE.Mesh(geometry, material);
          cube.position.set(claim.coords[0], 0, claim.coords[1]);

          sceneRef.current?.add(cube);

        };
        console.log(base64DataUrl)
        image.src = base64DataUrl;

    });
  }
  useEffect(() => {
    walletRef.current = wallet;
  },[wallet])

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    // Inside your useEffect hook, after initializing the camera and renderer
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false; // Disable zooming
    controls.addEventListener('change', () => {
      // This event listener is called whenever the camera moves
      // You can access the camera's current position using camera.position
    });
    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement);
    }
    // Generate the icon as a canvas element
    const icon = hydroIdenticon.create({
      seed: 'SolsticioSpace', // Replace 'randstring' with your desired seed
      size: 64, // Size of the icon
    });
    console.log(icon);
    // Convert SVG string to Data URL
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(icon);
    const svgBase64 = btoa(svgString);
    console.log(svgBase64)
    const base64DataUrl = `data:image/svg+xml;base64,${svgBase64}`;
    const cameraMarker = new THREE.Mesh(new THREE.SphereGeometry(0.1), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
    scene.add(cameraMarker); // Add the marker to the scene
    
    // Create an image and load the SVG
    const image = new Image();
    image.onload = () => {
      // Once the image is loaded, create the texture
      const texture = new THREE.Texture(image);
      texture.needsUpdate = true;
      texture.minFilter = THREE.LinearFilter; // Use LinearFilter to avoid needing mipmaps

      // Use the texture in a material
      const material = new THREE.MeshBasicMaterial({ map: texture });

      // Create your mesh with the material
      const geometry = new THREE.BoxGeometry();
      const cube = new THREE.Mesh(geometry, material);
      cube.position.set(1,0,1)
      scene.add(cube);
      const animate = () => {
        requestAnimationFrame(animate);
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        cameraMarker.position.copy(camera.position);

        renderer.render(scene, camera);
      };

      animate();
      sceneRef.current = scene;
    };
    console.log(base64DataUrl)
    image.src = base64DataUrl;


    camera.position.z = 5;

    // Function to handle camera movement
    const moveCamera = (event) => {
      const key = event.key;
      switch (key) {
        case 'w': // forward
          camera.position.z -= 0.1;
          break;
        case 's': // back
          camera.position.z += 0.1;
          break;
        case 'a': // left
          camera.position.x -= 0.1;
          break;
        case 'd': // right
          camera.position.x += 0.1;
          break;
        case 'f': // Call request_claim when 'f' is pressed
          if (walletRef.current?.connected && walletRef.current?.publicKey) {
            const uri = walletRef.current.publicKey.toString();
            // Assuming the camera's x and z positions are what you want to use as coordinates
            // and converting them to a format that matches your smart contract's expectations
            const coords = [camera.position.x,camera.position.z] as [number, number];
            requestClaim(uri, coords);
          } else {
            console.log("Wallet not connected");
          }
          break;
        default:
          break;
      }
    };

    // Add event listener for keyboard events
    window.addEventListener('keydown', moveCamera);

    // Clean up event listener
    return () => {
      window.removeEventListener('keydown', moveCamera);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  

  useEffect(() => {
    if (wallet.connected && wallet.publicKey) {
      // Use the wallet's public key as the seed for the snowflake icon
      fetchClaims();
      const icon = hydroIdenticon.create({
        seed: wallet.publicKey.toString(), // Replace 'randstring' with your desired seed
        size: 64, // Size of the icon
      });
      console.log(icon);
      // Convert SVG string to Data URL
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(icon);
      const svgBase64 = btoa(svgString);
      console.log(svgBase64)
      const base64DataUrl = `data:image/svg+xml;base64,${svgBase64}`;
      setWalletIconSVG(base64DataUrl);
    } else {
      setWalletIconSVG(null); // Reset the icon when the wallet is disconnected
    }
  }, [wallet.connected, wallet.publicKey]);

  return (
    <div className={styles.container}>
      <div ref={mountRef} className={styles.threeCanvas}></div>
      {walletIconSVG && (
        <img className={styles.walletIcon} src={walletIconSVG}/>
      )}
      <div className={styles.walletButton}>
        <WalletMultiButton />
      </div>
    </div>
  );
}