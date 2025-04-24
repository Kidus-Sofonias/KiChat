self.addEventListener("push", function (event) {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: "/chat-icon.png",
    badge: "/badge-icon.png",
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});
