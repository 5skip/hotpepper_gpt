"use client"
import { useLoadScript, GoogleMap as GoogleMapComponent, Marker } from "@react-google-maps/api";
import { FC, useState, useCallback } from "react";
import axios from "axios";
import { FaMapMarkerAlt, FaMoneyBillWave, FaUtensils } from 'react-icons/fa';
import ChatBot from './chatbot';

const mapContainerStyle = {
  width: "100%",
  height: "250px",
};

const center = {
  lat: 35.0116, // 京都の緯度
  lng: 135.7681, // 京都の経度
};

const GoogleMap: FC = () => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
  });

  const [selected, setSelected] = useState<{ lat: number; lng: number } | null>(null);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [showChatBot, setShowChatBot] = useState(false);

  const onMapClick = useCallback((event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      setSelected({ lat, lng });

      // FastAPIにリクエストを送信
      axios.post('http://localhost:8000/api/restaurants', { lat, lng })
        .then(response => {
          setRestaurants(response.data);
          setShowChatBot(true); // レストランリストが表示されたらチャットボックスを表示
        })
        .catch(error => {
          console.error("Error fetching restaurants:", error);
        });
    }
  }, []);

  if (loadError) return <div className="flex justify-center items-center h-full text-red-500">Error loading map</div>;
  if (!isLoaded) return <div className="flex justify-center items-center h-full text-gray-500">Loading map...</div>;

  return (
    <div className="p-8 bg-gray-300 h-screen mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-white p-3 rounded-lg">
        <div className="mb-4 p-4 bg-gray-100 border-b-4 border-gray-500 rounded-lg shadow-lg">
          <div className="flex flex-row justify-between">
          <h1 className="text-2xl font-extrabold mb-2 text-gray-800">Azure OpenAIで遊んでみた</h1>
          <div className="text-xs text-gray-500">
            Powered by <a className="underline text-blue-500" href="http://webservice.recruit.co.jp/">ホットペッパー Webサービス</a>
          </div>
          </div>
          <p className="text-gray-700">地図をクリックして近くのレストランを検索</p>
        </div>
        <div className="border border-gray-300 rounded-lg overflow-hidden shadow-lg mb-4">
          <GoogleMapComponent
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={14}
            onClick={onMapClick}
          >
            {selected && <Marker position={selected} />}
          </GoogleMapComponent>
        </div>

        <div className="bg-white ">
          <h2 className="text-xl font-semibold mb-4">近くのレストラン</h2>
          <ul className=" max-h-[400px] shadow-lg  rounded-lg overflow-y-auto">
            {restaurants.length === 0 ? (
              <p className="text-gray-500">地図をクリックしてください</p>
            ) : (
              restaurants.map((restaurant, index) => (
                <li key={index} className="p-4 bg-white rounded-md shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300">
                  <div className="flex items-center">
                    <img src={restaurant.photo} alt={restaurant.name} className="w-24 h-24 object-cover rounded-md mr-4" />
                    <div>
                      <span className="font-medium text-lg">{restaurant.name}</span><br />
                      <div className="flex items-center text-sm text-gray-600">
                        <FaMapMarkerAlt className="mr-2" />{restaurant.address}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <FaUtensils className="mr-2" />{restaurant.genre}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <FaMoneyBillWave className="mr-2" />Budget: {restaurant.budget}
                      </div>
                      <a href={restaurant.urls} target="_blank" className="text-blue-500 hover:underline mt-2 block">More info</a>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
      {showChatBot && (
        <div>
          <ChatBot restaurants={restaurants} />
        </div>
      )}
    </div>
    
  );
};

export default GoogleMap;
