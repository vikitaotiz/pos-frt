const publicVapidKey =
  "BL5jrUXcgOwJYUhLK6D-fF-L2pXP-grVUSRZ6g1ll6-3Q70hcVwF2RQxLNR4hmwFd51QAaPSPPmqGs9iPDnAmIs";

const sendNotification = async () => {
  if ("serviceWorker" in navigator) {
    const register = await navigator.serviceWorker.register("/worker.js", {
      scope: "/",
    });

    const subscription = await register.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: publicVapidKey,
    });

    await fetch("http://localhost:5000/subscribe", {
      method: "POST",
      body: JSON.stringify(subscription),
      headers: {
        "content-type": "application/json",
      },
    });
  }
};

export { sendNotification };
