import React from "react";
import Lottie from "lottie-react";
import lottieAnimation from "./loading-lottie.json";

export const LoadingSpinner = () => {
  return (
    <div
      className="flex justify-content-center align-items-center"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "#FBB7AE",
      }}
    >
      <Lottie
        style={{ width: "100vw" }}
        animationData={lottieAnimation}
        loop={true}
      />
    </div>
  );
};
