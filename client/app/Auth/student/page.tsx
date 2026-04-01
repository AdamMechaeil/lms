"use client";
import Main from "@/app/Components/Auth/Student/Main";
import MainFooter from "@/app/Components/Shared/Footer/MainFooter";

export default function StudentLogin() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 relative">
        <Main />
      </div>
      <MainFooter />
    </div>
  );
}
