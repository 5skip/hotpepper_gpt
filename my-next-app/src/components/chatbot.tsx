"use client"
// components/ChatBot.tsx
import React, { useState } from 'react';
import axios from 'axios';

const ChatBot: React.FC<{ restaurants: any[] }> = ({ restaurants }) => {
  const [messages, setMessages] = useState<{ user: boolean; text: string }[]>([]);
  const [input, setInput] = useState('');

  const handleSendMessage = async () => {
    if (!input) return;

    const userMessage = { user: true, text: input };
    setMessages([...messages, userMessage]);

    const systemMessage = {
      user: false,
      text: '適切なレストランを検索中...',
    };
    setMessages((prevMessages) => [...prevMessages, systemMessage]);

    const prompt = `
      あなたは以下の詳細に基づいてレストランの推薦を提供する役立つアシスタントです。ユーザーのリクエストに応じてリストの中から適切なおすすめをリスト形式で1~3個提示してあげてください。適切な場所に改行コードを入れてユーザーが見やすいようにしてください：
      ${restaurants.map((restaurant, index) => `
        ${index + 1}. 名前: ${restaurant.name}
           住所: ${restaurant.address}
           ジャンル: ${restaurant.genre}
           予算: ${restaurant.budget}
           アクセス: ${restaurant.access}
           URL: ${restaurant.urls}
      `).join('\n')}
      ユーザーのリクエスト: ${input}
    `;

    try {
      const response = await axios.post('/api/chatbot', { prompt });

      const assistantMessage = {
        user: false,
        text: response.data.message.replace(/\n/g, '<br/>'),
      };
      setMessages((prevMessages) => [...prevMessages.slice(0, -1), assistantMessage]);
    } catch (error) {
      console.error('Error fetching OpenAI response:', error);
      const errorMessage = {
        user: false,
        text: '申し訳ありませんが、リクエストの処理中にエラーが発生しました。後でもう一度お試しください。',
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    }

    setInput('');
  };

  return (
    <div className="chatbot-container border border-gray-300 rounded-lg shadow-lg mt-28 p-4 bg-white">
      <h2 className="text-xl font-semibold mb-4">レストランチャットボット</h2>
      <div className="messages-container mb-4 h-96 overflow-y-scroll border border-gray-200 p-2 rounded-md">
        {messages.map((message, index) => (
          <div key={index} className={`mb-2 ${message.user ? 'text-right' : 'text-left'}`}>
            <span
              className={`inline-block p-2 rounded-md ${message.user ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-800'}`}
              dangerouslySetInnerHTML={{ __html: message.text }}
            />
          </div>
        ))}
      </div>
      <div className="input-container flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border border-gray-300 p-2 rounded-md"
          placeholder="レストランの推薦を聞いてください..."
        />
        <button onClick={handleSendMessage} className="ml-2 bg-purple-500 text-white p-2 rounded-md">送信</button>
      </div>
    </div>
  );
};

export default ChatBot;
