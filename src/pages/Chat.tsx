import { DeepSeekChat } from '@/components/chat/DeepSeekChat';
import { Helmet } from 'react-helmet-async';

const Chat = () => {
  return (
    <>
      <Helmet>
        <title>DeepSeek Chat - AI Assistant</title>
        <meta name="description" content="Chat with DeepSeek R1 AI model. Experience advanced reasoning and natural conversation with the powerful DeepSeek AI assistant." />
      </Helmet>
      <DeepSeekChat />
    </>
  );
};

export default Chat;
