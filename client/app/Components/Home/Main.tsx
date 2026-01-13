"use client";
import React from "react";
import { WavyBackground } from "../ui/wavy-background";
import { HoverEffect } from "../ui/card-hover-effect";
import { GraduationCap, UserCog } from "lucide-react";

export default function Main() {
  const items = [
    {
      title: "Student Login",
      description: "Access your courses and materials",
      link: "/Auth/student",
      icon: <GraduationCap className="h-8 w-8 text-neutral-500" />,
    },
    {
      title: "Trainer Login",
      description: "Manage your batches and students",
      link: "/Auth/trainer",
      icon: <UserCog className="h-8 w-8 text-neutral-500" />,
    },
  ];

  return (
    <WavyBackground className="max-w-4xl mx-auto pb-40">
      <p className="text-2xl md:text-4xl lg:text-7xl text-black dark:text-white font-bold inter-var text-center">
        Welcome to LMS
      </p>
      <p className="text-base md:text-lg mt-4 text-black dark:text-white font-normal inter-var text-center">
        Empowering learning for everyone
      </p>
      <HoverEffect
        items={items}
        className="max-w-5xl mx-auto gap-8 md:gap-14"
      />
    </WavyBackground>
  );
}
