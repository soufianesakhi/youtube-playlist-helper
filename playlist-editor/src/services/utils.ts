import { Notyf } from "notyf";
import "notyf/notyf.min.css";

const notify = new Notyf({
  duration: 5000,
  dismissible: true,
});

const inform = new Notyf({
  duration: 5000,
  dismissible: true,
  types: [
    {
      type: "info",
      background: "#007bff",
      icon: false,
    },
  ],
});

window.error = (message) => {
  notify.error(message);
  return () => notify.dismissAll();
};
window.success = (message) => {
  notify.success(message);
  return () => notify.dismissAll();
};
window.info = (message) => {
  inform.open({ type: "info", message });
  return () => inform.dismissAll();
};
