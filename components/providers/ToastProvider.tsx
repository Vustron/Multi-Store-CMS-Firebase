"use client";

import { CircleCheckBig, CircleAlert, Loader2 } from "lucide-react";
import toast, { Toaster, resolveValue } from "react-hot-toast";
import { styled, keyframes } from "goober";
import React from "react";

const ToastProvider = () => {
  const BaseToast = styled("div")`
    background: #f7f7f7;
    border-radius: 10px;
    color: #161925;
    display: flex;
    align-items: center;
    padding: 5px;
    padding-right: 10px;
    width: 200px;
    height: 50px;
    border: 2px solid
      ${(p: any) =>
        p.type === "loading"
          ? "#fbbf24" // Yellow
          : p.type === "success"
            ? "#61d345" // Green
            : "#ff4b4b"}; // Red
  `;

  const Content = styled("div")`
    flex: 1;
    padding: 10px;
    text-align: left;
  `;

  const IconWrapper = styled("div")`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    margin-right: 0px;
    margin-left: 5px;
  `;

  const Indicator = styled("div")`
    background: ${(p: any) =>
      p.type === "loading"
        ? "#fbbf24" // Yellow
        : p.type === "success"
          ? "#61d345" // Green
          : "#ff4b4b"}; // Red
    border-radius: 99px;
    width: 5px;
    height: 100%;
    transition: all 0.2s ease-in-out;
  `;

  const DismissButton = styled("button")`
    width: 16px;
    height: 16px;
    font-size: 24px;
    display: flex;
    justify-items: center;
    align-items: center;
    background: transparent;
    padding: 12px;
    border: none;
    color: gray;
    &:hover {
      color: black;
    }
  `;

  const enterAnimation = keyframes`
  from {
    opacity: 0;
    transform: translateY(-30px) scale(0.8);
  }
  to {
    opacity: 1;
    transform: translateY(0px) scale(1);
  }
  `;

  const exitAnimation = keyframes`
  from {
    opacity: 1;
    transform: translateY(0px) scale(1);
  }
  to {
    opacity: 0;
    transform: translateY(-30px) scale(0.8);
  }
`;

  const getIcon = (type: string) => {
    switch (type) {
      case "loading":
        return <Loader2 className="size-6 animate-spin text-yellow-600" />;
      case "success":
        return <CircleCheckBig className="size-6 text-green-600" />;
      default:
        return <CircleAlert className="size-6 text-rose-600" />;
    }
  };

  return (
    <>
      <Toaster position="top-center">
        {(t) => (
          <BaseToast
            type={t.type}
            style={{
              animation: t.visible
                ? `${enterAnimation} 0.2s ease-out forwards`
                : `${exitAnimation} 0.4s ease-in forwards`,
            }}
          >
            <Indicator type={t.type} />
            <IconWrapper>{getIcon(t.type)}</IconWrapper>
            <Content>{resolveValue(t.message, t)}</Content>
            {t.type !== "loading" && (
              <DismissButton onClick={() => toast.dismiss(t.id)}>
                &#215;
              </DismissButton>
            )}
          </BaseToast>
        )}
      </Toaster>
    </>
  );
};

export default ToastProvider;
