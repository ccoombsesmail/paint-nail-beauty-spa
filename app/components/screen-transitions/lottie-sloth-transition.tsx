// components/LottieTransition.js
import Lottie from 'lottie-react';
import animationData from '../loading-screen/loading-lottie.json';

const LottieTransition = ({ isVisible, onComplete }: {isVisible: boolean, onComplete: () => void}) => {
  return (
    <div style={{ display: isVisible ? 'block' : 'none' }}>
      <Lottie
        animationData={animationData}
        autoplay={isVisible}
        loop={true}
        onComplete={onComplete}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default LottieTransition;
