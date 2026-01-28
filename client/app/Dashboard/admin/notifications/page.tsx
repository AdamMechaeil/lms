"use client";
import React from "react";
import CreateNotification from "@/app/Components/Dashboard/Admin/Notifications/CreateNotification";

const NotificationsPage = () => {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Notifications</h1>
        <p className="text-gray-400">Manage and send notifications to users.</p>
      </div>

      <CreateNotification />

      {/* 
        Future: Add <NotificationsHistory /> or <RecentActivity /> here 
        For now, just the Create form as requested.
      */}
    </div>
  );
};

export default NotificationsPage;
