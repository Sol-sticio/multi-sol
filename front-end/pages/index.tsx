import { NextPage } from "next"
import Three from "../components/Three";
// In your page or parent component
import dynamic from 'next/dynamic';

const ThreePageNoSSR = dynamic(() => import('../components/Three'), {
  ssr: false,
});


const Home: NextPage = (props) => {

  return (
    <ThreePageNoSSR/>
  )
}

export default Home
