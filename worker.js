self.addEventListener("push", (e) => {
  const data = e.data.json();

  self.registration.showNotification(data.title, {
    body: `Amount: ${data.amount}. Mode: ${data.mode}`,
    icon: "https://cdn.britannica.com/15/15-004-B5D6BF80/Flag-Kenya.jpg",
    vibrate: [200, 100, 100],
  });
});
