import "./style.css";
import { mount } from "./ui";

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) throw new Error("#app missing");
mount(app);
