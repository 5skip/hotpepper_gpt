"use client"

// pages/index.tsx
import { NextPage } from 'next';
import GoogleMap from '../components/googlemap';

const Home: NextPage = () => {
  return (
    <div>
      <GoogleMap />
    </div>
  );
};

export default Home;


